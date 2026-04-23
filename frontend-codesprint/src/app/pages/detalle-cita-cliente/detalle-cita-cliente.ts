import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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

declare var paypal: any;

@Component({
  selector: 'app-detalle-cita-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  templateUrl: './detalle-cita-cliente.html',
  styleUrls: ['./detalle-cita-cliente.css']
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

  paymentSuccess = '';
  paymentError = '';
  processingPayment = false;
  paymentModalOpen = false;
  paypalRendered = false;

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

  canPayBooking(): boolean {
    const status = this.cita.rawStatus?.toUpperCase() ?? '';
    return status !== 'PAGADO'
      && status !== 'COMPLETADO'
      && status !== 'CANCELADO'
      && status !== 'CANCELADA'
      && status !== 'RECHAZADA';
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
          text: 'El proveedor fue notificado de la cancelación.',

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

  return status !== 'COMPLETADO'
    && status !== 'CANCELADO'
    && status !== 'CANCELADA'
    && status !== 'PAGADO'
    && status !== 'RECHAZADA';
}

 pagarServicio(): void {
  if (!this.bookingId || !this.canPayBooking()) {
    return;
  }

  this.paymentError = '';
  this.paymentSuccess = '';
  this.processingPayment = false;
  this.paymentModalOpen = true;
  this.paypalRendered = false;
  this.cdr.detectChanges();

  setTimeout(() => {
    this.renderPaypalButton();
  }, 250);
}

  closePaymentModal(): void {
    this.paymentModalOpen = false;
    this.paypalRendered = false;
    this.processingPayment = false;

    const container = document.getElementById('paypal-button-container-booking');
    if (container) {
      container.innerHTML = '';
    }
  }

  private renderPaypalButton(): void {
    if (!this.bookingId || this.paypalRendered) {
      return;
    }

    const container = document.getElementById('paypal-button-container-booking');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    paypal.Buttons({
      createOrder: async (_data: any, _actions: any) => {
        try {
          this.processingPayment = true;
          this.paymentError = '';
          this.paymentSuccess = '';
          this.cdr.detectChanges();

          const response = await firstValueFrom(
            this.agendaService.createPaypalOrderForBooking(this.bookingId!)
          );

          const orderId = this.extractOrderId(response);

          if (!orderId) {
            throw new Error('El backend no devolvió un orderId válido.');
          }

          return orderId;
        } catch (error) {
          console.error('Error creando orden PayPal para cita:', error);
          this.processingPayment = false;
          this.paymentError = 'No se pudo crear la orden de PayPal.';
          this.cdr.detectChanges();
          throw error;
        }
      },

      onApprove: async (data: any, _actions: any) => {
        try {
          const response = await firstValueFrom(
            this.agendaService.capturePaypalOrderForBooking(data.orderID, this.bookingId!)
          );

          const status = this.extractCaptureStatus(response);

          if (status === 'COMPLETED' || status === 'PAGADO' || status === 'SUCCESS') {
            this.processingPayment = false;
            this.paymentError = '';
            this.paymentSuccess = '¡Pago completado con éxito! Tu cita ya quedó pagada.';
            this.closePaymentModal();
            this.loadDetail(false);
            this.cdr.detectChanges();
            return;
          }

          this.processingPayment = false;
          this.paymentSuccess = '';
          this.paymentError = 'El pago no se completó correctamente.';
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error capturando pago de cita:', error);
          this.processingPayment = false;
          this.paymentSuccess = '';
          this.paymentError = 'No se pudo capturar el pago.';
          this.cdr.detectChanges();
          throw error;
        }
      },

      onError: (err: any) => {
        console.error('Error en PayPal SDK:', err);
        this.processingPayment = false;
        this.paymentSuccess = '';
        this.paymentError = 'Ocurrió un error durante el pago.';
        this.cdr.detectChanges();
      },

      onCancel: () => {
        this.processingPayment = false;
        this.paymentError = 'El pago fue cancelado por el usuario.';
        this.cdr.detectChanges();
      }
    }).render('#paypal-button-container-booking');

    this.paypalRendered = true;
  }

  private extractOrderId(response: any): string | null {
    if (!response) return null;

    if (typeof response === 'string') {
      return response;
    }

    if (response.orderId) return response.orderId;
    if (response.id) return response.id;
    if (response.paypalOrderId) return response.paypalOrderId;

    if (response.message && typeof response.message === 'string') {
      const match = response.message.match(/[A-Z0-9]{10,}/);
      return match ? match[0] : null;
    }

    return null;
  }

  private extractCaptureStatus(response: any): string {
    if (!response) return '';

    if (typeof response === 'string') {
      return response.toUpperCase().trim();
    }

    if (response.status) return String(response.status).toUpperCase().trim();
    if (response.orderStatus) return String(response.orderStatus).toUpperCase().trim();
    if (response.paymentStatus) return String(response.paymentStatus).toUpperCase().trim();
    if (response.message) return String(response.message).toUpperCase().trim();

    return '';
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