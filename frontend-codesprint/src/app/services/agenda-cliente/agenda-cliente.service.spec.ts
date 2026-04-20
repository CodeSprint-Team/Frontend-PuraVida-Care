import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AgendaClienteService } from './agenda-cliente.service';
import { AgendaBookingResponseDTO, RescheduleRequestDTO } from '../../interfaces/client/agenda-booking.interface';
import { environment } from '../../../environments/environment';

//Datos de prueba

const mockBooking = {
  bookingId: 1,
  serviceTitle: 'Transporte médico',
  serviceDescription: 'Traslado al hospital',
  categoryName: 'Transporte',
  providerFullName: 'Juan Pérez',
  scheduledAt: '2025-08-15T10:00:00.000Z',
  bookingStatus: 'PENDIENTE',
  agreedPrice: 15000,
  seniorAddress: 'San José',
  destinationLatitude: 0,
  destinationLongitude: 0,
} as unknown as AgendaBookingResponseDTO;

const mockBookingCancelado = {
  ...mockBooking,
  bookingStatus: 'CANCELADO',
} as unknown as AgendaBookingResponseDTO;

const mockBookingReprogramado = {
  ...mockBooking,
  scheduledAt: '2025-09-01T09:00:00.000Z',
} as unknown as AgendaBookingResponseDTO;

describe('AgendaClienteService (HTTP)', () => {
  let service: AgendaClienteService;
  let httpMock: HttpTestingController;

  const apiUrl     = `${environment.apiUrl}/agenda-cliente`;
  const profileUrl = `${environment.apiUrl}/profiles/client`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AgendaClienteService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service  = TestBed.inject(AgendaClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // getClientProfileIdByUserId

  describe('getClientProfileIdByUserId', () => {
    it('debería hacer GET al endpoint correcto y retornar el id del perfil', () => {
      let resultado: number | undefined;

      service.getClientProfileIdByUserId(42).subscribe((id) => {
        resultado = id;
      });

      const req = httpMock.expectOne(`${profileUrl}/by-user/42`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 7 });

      expect(resultado).toBe(7);
    });

    it('debería extraer solo el campo id de la respuesta del perfil', () => {
      let resultado: number | undefined;

      service.getClientProfileIdByUserId(10).subscribe((id) => {
        resultado = id;
      });

      httpMock.expectOne(`${profileUrl}/by-user/10`).flush({ id: 99, nombre: 'Extra', email: 'x@x.com' });

      expect(resultado).toBe(99);
    });
  });

  // getAgenda

  describe('getAgenda', () => {
    it('debería hacer GET al endpoint correcto y retornar la lista de bookings', () => {
      let resultado: AgendaBookingResponseDTO[] | undefined;

      service.getAgenda(5).subscribe((bookings) => {
        resultado = bookings;
      });

      const req = httpMock.expectOne(`${apiUrl}/5`);
      expect(req.request.method).toBe('GET');
      req.flush([mockBooking]);

      expect(resultado).toHaveLength(1);
      expect(resultado![0].bookingId).toBe(1);
    });

    it('debería retornar lista vacía si no hay bookings', () => {
      let resultado: AgendaBookingResponseDTO[] | undefined;

      service.getAgenda(5).subscribe((bookings) => {
        resultado = bookings;
      });

      httpMock.expectOne(`${apiUrl}/5`).flush([]);

      expect(resultado).toHaveLength(0);
    });
  });

  // getAgendaByUserId

  describe('getAgendaByUserId', () => {
    it('debería encadenar getClientProfileIdByUserId y getAgenda correctamente', () => {
      let resultado: AgendaBookingResponseDTO[] | undefined;

      service.getAgendaByUserId(42).subscribe((bookings) => {
        resultado = bookings;
      });

      // Primer request: obtener el clientProfileId
      const profileReq = httpMock.expectOne(`${profileUrl}/by-user/42`);
      expect(profileReq.request.method).toBe('GET');
      profileReq.flush({ id: 7 });

      // Segundo request: obtener la agenda con el profileId
      const agendaReq = httpMock.expectOne(`${apiUrl}/7`);
      expect(agendaReq.request.method).toBe('GET');
      agendaReq.flush([mockBooking]);

      expect(resultado).toHaveLength(1);
      expect(resultado![0].serviceTitle).toBe('Transporte médico');
    });

    it('debería usar el clientProfileId correcto en el segundo request', () => {
      service.getAgendaByUserId(99).subscribe();

      httpMock.expectOne(`${profileUrl}/by-user/99`).flush({ id: 55 });
      const agendaReq = httpMock.expectOne(`${apiUrl}/55`);

      expect(agendaReq.request.url).toContain('/55');
      agendaReq.flush([]);
    });
  });

  // getBookingDetail

  describe('getBookingDetail', () => {
    it('debería hacer GET al endpoint de detalle con los ids correctos', () => {
      let resultado: AgendaBookingResponseDTO | undefined;

      service.getBookingDetail(5, 1).subscribe((booking) => {
        resultado = booking;
      });

      const req = httpMock.expectOne(`${apiUrl}/5/detail/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBooking);

      expect(resultado!.bookingId).toBe(1);
      expect(resultado!.serviceTitle).toBe('Transporte médico');
    });
  });

  // cancelBooking

  describe('cancelBooking', () => {
    it('debería hacer PUT al endpoint de cancelación con body vacío', () => {
      let resultado: AgendaBookingResponseDTO | undefined;

      service.cancelBooking(5, 1).subscribe((booking) => {
        resultado = booking;
      });

      const req = httpMock.expectOne(`${apiUrl}/5/cancel/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(mockBookingCancelado);

      expect(resultado!.bookingStatus).toBe('CANCELADO');
    });

    it('debería construir la URL correctamente con distintos ids', () => {
      service.cancelBooking(10, 99).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/10/cancel/99`);
      expect(req.request.url).toContain('/10/cancel/99');
      req.flush(mockBookingCancelado);
    });
  });

  // rescheduleBooking

  describe('rescheduleBooking', () => {
    const dto: RescheduleRequestDTO = {
      newScheduledAt: '2025-09-01T09:00:00.000Z',
    } as unknown as RescheduleRequestDTO;

    it('debería hacer PUT al endpoint de reagendado con el DTO correcto', () => {
      let resultado: AgendaBookingResponseDTO | undefined;

      service.rescheduleBooking(5, 1, dto).subscribe((booking) => {
        resultado = booking;
      });

      const req = httpMock.expectOne(`${apiUrl}/5/reschedule/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockBookingReprogramado);

      expect(resultado!.scheduledAt).toBe('2025-09-01T09:00:00.000Z');
    });

    it('debería enviar la nueva fecha en el body del request', () => {
      const dtoConFecha: RescheduleRequestDTO = {
        newScheduledAt: '2025-12-25T08:00:00.000Z',
      } as unknown as RescheduleRequestDTO;

      service.rescheduleBooking(5, 1, dtoConFecha).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/5/reschedule/1`);
      expect(req.request.body.newScheduledAt).toBe('2025-12-25T08:00:00.000Z');
      req.flush(mockBookingReprogramado);
    });
  });
});
