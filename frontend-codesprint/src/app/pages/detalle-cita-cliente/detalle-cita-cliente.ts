import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../components/navbar/navbar';
import { DetalleCita } from '../../interfaces/client/detalle-cita.interface';
import {
  AgendaBookingResponseDTO,
  RescheduleRequestDTO,
  CancelBookingRequestDTO
} from '../../interfaces/client/agenda-booking.interface';
import { AgendaClienteService } from '../../services/agenda-cliente/agenda-cliente.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-detalle-cita-cliente',
  imports: [RouterLink, FormsModule, NavbarComponent],
  templateUrl: './detalle-cita-cliente.html',
  styleUrls: ['./detalle-cita-cliente.css'],
  standalone: true
})
export class DetalleCitaCliente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly agendaService = inject(AgendaClienteService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  cita: DetalleCita = this.emptyCita();
  loading = true;
  errorMessage = '';
  processing = false;

  showModalReprogramar = false;
  showModalCancelar = false;

  nuevaFecha = '';
  nuevaHora = '';
  motivoReprogramacion = '';
  motivoCancelacion = '';

  private clientProfileId: number | null = null;
  private bookingId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.bookingId = id ? Number(id) : null;

    if (!this.bookingId || Number.isNaN(this.bookingId)) {
      this.loading = false;
      this.errorMessage = 'El id de la cita no es válido.';
      this.cdr.detectChanges();
      return;
    }

    this.loadDetail();
  }

  openReprogramar(): void {
    if (!this.canEditBooking()) return;
    this.nuevaFecha = '';
    this.nuevaHora = '';
    this.motivoReprogramacion = '';
    this.showModalReprogramar = true;
  }

  closeReprogramar(): void {
    if (this.processing) return;
    this.showModalReprogramar = false;
  }

  confirmarReprogramar(): void {
    if (!this.clientProfileId || !this.bookingId) return;

    if (!this.nuevaFecha || !this.nuevaHora) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha y hora requeridas',
        text: 'Debes elegir la nueva fecha y la nueva hora.',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    if (!this.motivoReprogramacion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes indicar el motivo de la reprogramación.',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    const nuevaFechaHora = new Date(`${this.nuevaFecha}T${this.nuevaHora}:00`);
    const ahora = new Date();

    if (Number.isNaN(nuevaFechaHora.getTime())) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La fecha u hora seleccionada no es válida.',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    if (nuevaFechaHora <= ahora) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La nueva fecha y hora deben ser posteriores al momento actual.',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    const dto: RescheduleRequestDTO = {
      scheduledAt: `${this.nuevaFecha}T${this.nuevaHora}:00`,
      rescheduleReason: this.motivoReprogramacion.trim()
    };

    this.processing = true;

    this.agendaService.rescheduleBooking(this.clientProfileId, this.bookingId, dto).subscribe({
      next: () => {
        this.processing = false;
        this.showModalReprogramar = false;
        this.loadDetail(false);

        Swal.fire({
          icon: 'success',
          title: 'Cita reprogramada',
          text: 'La cita quedó reprogramada y volverá a estado pendiente hasta que el proveedor la acepte.',
          confirmButtonColor: '#14b8a6'
        });
      },
      error: (error) => {
        this.processing = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo reprogramar',
          text: this.getErrorMessage(error),
          confirmButtonColor: '#14b8a6'
        });
      }
    });
  }

  openCancelar(): void {
    if (!this.canEditBooking()) return;
    this.motivoCancelacion = '';
    this.showModalCancelar = true;
  }

  closeCancelar(): void {
    if (this.processing) return;
    this.showModalCancelar = false;
  }

  confirmarCancelar(): void {
    if (!this.clientProfileId || !this.bookingId) return;

    if (!this.motivoCancelacion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes indicar la razón de la cancelación.',
        confirmButtonColor: '#14b8a6'
      });
      return;
    }

    const dto: CancelBookingRequestDTO = {
      cancellationReason: this.motivoCancelacion.trim()
    };

    this.processing = true;

    this.agendaService.cancelBooking(this.clientProfileId, this.bookingId, dto).subscribe({
      next: () => {
        this.processing = false;
        this.showModalCancelar = false;
        this.loadDetail(false);

        Swal.fire({
          icon: 'success',
          title: 'Cita cancelada',
          text: 'La cita fue cancelada correctamente y el proveedor será notificado.',
          confirmButtonColor: '#14b8a6'
        });
      },
      error: (error) => {
        this.processing = false;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cancelar',
          text: this.getErrorMessage(error),
          confirmButtonColor: '#14b8a6'
        });
      }
    });
  }

  canEditBooking(): boolean {
    const status = this.cita.rawStatus?.toUpperCase() ?? '';
    return status !== 'COMPLETADO' && status !== 'CANCELADO';
  }

  private loadDetail(showSpinner = true): void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      this.loading = false;
      this.errorMessage = 'Necesitas iniciar sesión.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.bookingId) {
      this.loading = false;
      this.errorMessage = 'No se encontró el id de la cita.';
      this.cdr.detectChanges();
      return;
    }

    if (showSpinner) this.loading = true;
    this.errorMessage = '';

    this.agendaService.getClientProfileIdByUserId(userId).subscribe({
      next: (profileId) => {
        this.clientProfileId = profileId;

        this.agendaService.getBookingDetail(profileId, this.bookingId as number).subscribe({
          next: (dto) => {
            this.cita = this.mapToDetalle(dto);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('detalle error', error);
            this.loading = false;
            this.errorMessage = 'No se pudo cargar el detalle de la cita.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('detalle profile error', error);
        this.loading = false;
        this.errorMessage = 'No se pudo resolver tu perfil.';
        this.cdr.detectChanges();
      }
    });
  }

  private mapToDetalle(dto: AgendaBookingResponseDTO): DetalleCita {
    const scheduledDate = this.parseBackendDate(dto.scheduledAt);
    const createdDate = this.parseBackendDate(dto.createdAt);

    return {
      citaId: String(dto.bookingId).padStart(6, '0'),
      bookingId: dto.bookingId,
      servicio: {
        nombre: dto.serviceTitle,
        subtitulo: dto.categoryName || dto.serviceDescription || 'Servicio'
      },
      fecha: scheduledDate.toLocaleDateString('es-CR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      hora: scheduledDate.toLocaleTimeString('es-CR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      duracionEstimada: 'Por definir',
      origen: this.coordinatesOrText(dto.originLatitude, dto.originLongitude, 'Origen no especificado'),
      destino:
        dto.seniorAddress ||
        this.coordinatesOrText(dto.destinationLatitude, dto.destinationLongitude, 'Destino no especificado'),
      notas: dto.rejectionReason || '',
      proveedor: {
        emoji: this.getEmojiByCategory(dto.categoryName),
        nombre: dto.providerFullName,
        especialidad: dto.providerTypeName || dto.categoryName || 'Proveedor',
        telefono: dto.providerPhone || 'No disponible'
      },
      paciente: {
        nombre: dto.seniorFullName || 'Adulto mayor',
        reservadoPor: dto.clientFullName || 'Cliente',
        fechaReserva: createdDate.toLocaleDateString('es-CR')
      },
      precio: new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        maximumFractionDigits: 0
      }).format(this.toSafeNumber(dto.agreedPrice)),
      status: this.toUiStatus(dto.bookingStatus, scheduledDate),
      rawStatus: dto.bookingStatus,
      providerProfileId: dto.providerProfileId
    };
  }

  private toSafeNumber(value: number | string): number {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  }

  private parseBackendDate(value: string): Date {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const normalized = value.replace(/(\.\d{3})\d+/, '$1');
    const fallback = new Date(normalized);
    if (!Number.isNaN(fallback.getTime())) return fallback;

    return new Date();
  }

  private coordinatesOrText(
    latitude: number | null,
    longitude: number | null,
    fallback: string
  ): string {
    const hasCoordinates = latitude !== null && longitude !== null;
    if (!hasCoordinates) return fallback;
    return `${latitude}, ${longitude}`;
  }

  private toUiStatus(
    rawStatus: string,
    scheduledDate: Date
  ): 'Programado' | 'Hoy' | 'Completado' | 'Cancelado' {
    const normalized = rawStatus?.toUpperCase() ?? '';

    if (normalized === 'COMPLETADO') return 'Completado';
    if (normalized === 'CANCELADO') return 'Cancelado';

    const today = new Date();
    const isToday =
      scheduledDate.getDate() === today.getDate() &&
      scheduledDate.getMonth() === today.getMonth() &&
      scheduledDate.getFullYear() === today.getFullYear();

    return isToday ? 'Hoy' : 'Programado';
  }

  private getEmojiByCategory(category: string): string {
    const normalized = (category || '').toLowerCase();
    if (normalized.includes('transporte')) return 'TR';
    if (normalized.includes('enfermer')) return 'ENF';
    if (normalized.includes('compan')) return 'AC';
    return 'SVC';
  }

  private getErrorMessage(error: any): string {
    return error?.error?.message || error?.error || 'Intenta nuevamente.';
  }

  private emptyCita(): DetalleCita {
    return {
      citaId: '',
      bookingId: 0,
      servicio: { nombre: '', subtitulo: '' },
      fecha: '',
      hora: '',
      duracionEstimada: '',
      origen: '',
      destino: '',
      notas: '',
      proveedor: { emoji: 'SVC', nombre: '', especialidad: '', telefono: '' },
      paciente: { nombre: '', reservadoPor: '', fechaReserva: '' },
      precio: '',
      status: 'Programado',
      rawStatus: '',
      providerProfileId: 0
    };
  }

  private getCurrentUserId(): number | null {
    const userId = this.authService.getUserId();
    if (!userId) return null;

    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }
}