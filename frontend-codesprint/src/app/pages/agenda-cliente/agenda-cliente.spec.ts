import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AgendaCliente } from './agenda-cliente';
import { AgendaClienteService } from '../../services/agenda-cliente/agenda-cliente.service';
import { AuthService } from '../../services/auth.service';
import { AgendaBookingResponseDTO } from '../../interfaces/client/agenda-booking.interface';


function makeBooking(overrides: Partial<AgendaBookingResponseDTO>): AgendaBookingResponseDTO {
  const base = {
    bookingId: 1,
    serviceTitle: 'Servicio base',
    serviceDescription: 'Descripción base',
    categoryName: 'Otro',
    providerFullName: 'Proveedor Base',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    bookingStatus: 'PENDIENTE',
    agreedPrice: 10000,
    seniorAddress: 'San José, Costa Rica',
    destinationLatitude: 0,
    destinationLongitude: 0,
  };
  return { ...base, ...overrides } as unknown as AgendaBookingResponseDTO;
}

// Bookings de prueba

const bookingFuturo     = makeBooking({ bookingId: 1, categoryName: 'Transporte', scheduledAt: new Date(Date.now() + 86400000).toISOString(),  bookingStatus: 'PENDIENTE',   agreedPrice: 15000, seniorAddress: 'San José, Costa Rica', destinationLatitude: 0,      destinationLongitude: 0        });
const bookingCompletado = makeBooking({ bookingId: 2, categoryName: 'Enfermería', scheduledAt: new Date(Date.now() - 86400000).toISOString(),  bookingStatus: 'COMPLETADO',  agreedPrice: 25000, seniorAddress: '',                    destinationLatitude: 9.9341, destinationLongitude: -84.0877 });
const bookingCancelado  = makeBooking({ bookingId: 3, categoryName: 'Compañía',  scheduledAt: new Date(Date.now() - 172800000).toISOString(), bookingStatus: 'CANCELADO',   agreedPrice: 8000,  seniorAddress: '',                    destinationLatitude: 0,      destinationLongitude: 0        });
const bookingHoy        = makeBooking({ bookingId: 4, categoryName: 'Otro',      scheduledAt: new Date(Date.now() + 3600000).toISOString(),                        bookingStatus: 'PENDIENTE',   agreedPrice: 5000,  seniorAddress: 'Heredia, Costa Rica', destinationLatitude: 0,      destinationLongitude: 0        });

// principal

describe('AgendaCliente', () => {
  let component: AgendaCliente;
  let fixture: ComponentFixture<AgendaCliente>;

  const getAgendaByUserId = vi.fn();
  const getUserId         = vi.fn();

  const agendaServiceMock = { getAgendaByUserId };
  const authServiceMock   = { getUserId };

  beforeEach(async () => {
    vi.clearAllMocks();
    getAgendaByUserId.mockReturnValue(of([]));
    getUserId.mockReturnValue('42');

    await TestBed.configureTestingModule({
      imports: [AgendaCliente],
      providers: [
        provideRouter([]),
        { provide: AgendaClienteService, useValue: agendaServiceMock },
        { provide: AuthService,          useValue: authServiceMock   },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(AgendaCliente);
    component = fixture.componentInstance;
  });

  // Creación

  describe('Creación', () => {
    it('debería crearse correctamente', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component).toBeTruthy();
    });

    it('debería llamar getAgendaByUserId con el userId en ngOnInit', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getAgendaByUserId).toHaveBeenCalledWith(42);
      expect(getAgendaByUserId).toHaveBeenCalledTimes(1);
    });
  });

  // Estado de carga

  describe('Estado de carga (loading)', () => {
    it('debería tener loading=false después de que el servicio responda', async () => {
      getAgendaByUserId.mockReturnValue(of([]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.loading).toBe(false);
    });

    it('debería tener loading=false cuando el servicio falla', async () => {
      getAgendaByUserId.mockReturnValue(throwError(() => new Error('Error')));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.loading).toBe(false);
    });
  });

  // Sin sesión

  describe('Sin usuario autenticado', () => {
    it('debería mostrar mensaje de error si userId es null', async () => {
      getUserId.mockReturnValue(null);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.errorMessage).toContain('iniciar sesión');
      expect(component.loading).toBe(false);
    });

    it('no debería llamar al servicio si no hay userId', async () => {
      getUserId.mockReturnValue(null);
      getAgendaByUserId.mockClear();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getAgendaByUserId).not.toHaveBeenCalled();
    });

    it('debería mostrar error si userId no es un número válido', async () => {
      getUserId.mockReturnValue('abc');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.errorMessage).toContain('iniciar sesión');
    });
  });

  // Clasificación próximos / historial

  describe('Clasificación de bookings', () => {
    it('debería clasificar un booking futuro en próximos servicios', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingFuturo]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios.length).toBe(1);
      expect(component.historial.length).toBe(0);
    });

    it('debería clasificar COMPLETADO en historial', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingCompletado]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial.length).toBe(1);
      expect(component.proximosServicios.length).toBe(0);
    });

    it('debería clasificar CANCELADO en historial', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingCancelado]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial.length).toBe(1);
      expect(component.proximosServicios.length).toBe(0);
    });

    it('debería manejar mezcla de bookings correctamente', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingFuturo, bookingCompletado, bookingCancelado]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios.length).toBe(1);
      expect(component.historial.length).toBe(2);
      expect(component.totalServicios).toBe(3);
    });

    it('debería asignar status "Hoy" al booking de hoy', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingHoy]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios[0].status).toBe('Hoy');
    });
  });

  // Status UI

  describe('Estado visual (status)', () => {
    it('debería asignar "Completado" para COMPLETADO', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingCompletado]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial[0].status).toBe('Completado');
    });

    it('debería asignar "Cancelado" para CANCELADO', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingCancelado]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial[0].status).toBe('Cancelado');
    });

    it('debería asignar "Programado" para booking futuro', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingFuturo]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios[0].status).toBe('Programado');
    });
  });

  describe('Emoji por categoría', () => {
    const cases = [
      { category: 'Transporte médico', expected: 'TR'  },
      { category: 'Enfermería',        expected: 'ENF' },
      { category: 'acompanamiento',   expected: 'AC'  },
      { category: 'Otro servicio',     expected: 'SVC' },
      { category: '',                  expected: 'SVC' },
    ];

    cases.forEach(({ category, expected }) => {
      it(`debería devolver "${expected}" para categoría "${category || '(vacía)'}"`, async () => {
        getAgendaByUserId.mockReturnValue(of([makeBooking({ categoryName: category })]));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.proximosServicios[0].emoji).toBe(expected);
      });
    });
  });

  //Formato de precio

  describe('Formato de precio', () => {
    it('debería formatear precio en colones costarricenses', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingFuturo]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios[0].price).toContain('15');
    });

    it('debería formatear 0 si el valor es NaN', async () => {
      getAgendaByUserId.mockReturnValue(of([makeBooking({ agreedPrice: NaN as any })]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios[0].price).toContain('0');
    });
  });

  // Formato de ubicación

  describe('Formato de ubicación', () => {
    it('debería mostrar la dirección si existe', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingFuturo]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios[0].location).toBe('San José, Costa Rica');
    });

    it('debería mostrar "Destino registrado en mapa" si hay coordenadas pero no dirección', async () => {
      getAgendaByUserId.mockReturnValue(of([bookingCompletado]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial[0].location).toBe('Destino registrado en mapa');
    });

    it('debería mostrar "Ubicación por confirmar" si no hay nada', async () => {
      const b = makeBooking({
        seniorAddress: '',
        destinationLatitude: null as unknown as number,
        destinationLongitude: null as unknown as number,
        bookingStatus: 'CANCELADO',
      });
      getAgendaByUserId.mockReturnValue(of([b]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial[0].location).toBe('Ubicación por confirmar');
    });
  });

  // fechas

  describe('Parseo de fechas', () => {
    it('debería aceptar formato ISO estándar', async () => {
      getAgendaByUserId.mockReturnValue(of([makeBooking({ scheduledAt: '2025-08-15T10:30:00.000Z', bookingStatus: 'COMPLETADO' })]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial.length).toBe(1);
    });

    it('debería manejar milisegundos extra sin explotar', async () => {
      getAgendaByUserId.mockReturnValue(of([makeBooking({ scheduledAt: '2025-08-15T10:30:00.0000000', bookingStatus: 'COMPLETADO' })]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.historial.length).toBe(1);
    });

    it('debería no explotar si la fecha es inválida', async () => {
      getAgendaByUserId.mockReturnValue(of([makeBooking({ scheduledAt: 'fecha-invalida', bookingStatus: 'COMPLETADO' })]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.totalServicios).toBe(1);
    });
  });

  // Manejo de errores

  describe('Manejo de errores', () => {
    it('debería mostrar mensaje de error cuando el servicio falla', async () => {
      getAgendaByUserId.mockReturnValue(throwError(() => new Error('Error de red')));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.errorMessage).toContain('No se pudo cargar');
      expect(component.loading).toBe(false);
    });

    it('debería dejar las listas vacías si el servicio falla', async () => {
      getAgendaByUserId.mockReturnValue(throwError(() => new Error('500')));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.proximosServicios.length).toBe(0);
      expect(component.historial.length).toBe(0);
    });

    it('debería manejar lista vacía sin errores', async () => {
      getAgendaByUserId.mockReturnValue(of([]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.errorMessage).toBe('');
      expect(component.totalServicios).toBe(0);
    });
  });

  describe('Renderizado del template', () => {
    it('debería mostrar aviso de próximos vacíos', async () => {
      getAgendaByUserId.mockReturnValue(of([]));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('No tienes servicios proximos');
    });

    it('debería mostrar aviso de historial vacío', async () => {
      getAgendaByUserId.mockReturnValue(of([]));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aun no hay citas en historial');
    });

    it('debería mostrar el mensaje de error en el DOM', async () => {
      getAgendaByUserId.mockReturnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('No se pudo cargar');
    });
  });
});
