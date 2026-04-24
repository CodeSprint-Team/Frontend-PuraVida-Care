import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProviderBookingService } from '../../services/provider-booking-service';
import {
  ServiceBookingResponseNullable,
} from '../../interfaces/booking-model';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './provider-booking-detail.html',
  styleUrls: ['./provider-booking-detail.css'],
})
export class ProviderBookingDetail implements OnInit {
  role: 'client' | 'admin' | 'provider' | null = 'provider';
  booking: ServiceBookingResponseNullable | null = null;
  loading      = true;
  error        = '';

  showConfirmModal = false;
  actionType: 'ACEPTAR' | 'RECHAZAR' | null = null;
  actionLoading = false;

  providerProfileId = 0;
  bookingId         = 0;

  constructor(
    private router:         Router,
    private route:          ActivatedRoute,
    private bookingService: ProviderBookingService,
    private cdr:            ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bookingId         = Number(this.route.snapshot.paramMap.get('id'));
    this.providerProfileId = Number(localStorage.getItem('profile_id') ?? 0);

    if (this.providerProfileId && this.bookingId) {
      this.loadBooking();
    } else {
      this.error   = 'No se pudo identificar el proveedor o la solicitud.';
      this.loading = false;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Telemedicina
  // ─────────────────────────────────────────────────────────

  isTelemedicine(): boolean {
    if (!this.booking) return false;

    const type = (this.booking.appointmentType ?? '').toUpperCase();
    if (type === 'TELEMEDICINE' || type === 'TELEMEDICINA') return true;

    const title = (this.booking.serviceTitle ?? '').toLowerCase();
    return title.includes('telemedicina');
  }

  startTelemedicine(): void {
    if (!this.booking) return;
    const sessionId = this.booking.telemedSessionId ?? this.booking.bookingId;
    this.router.navigate(['/telemedicina/doctor-view/', sessionId]);
  }

  // ─────────────────────────────────────────────────────────
  // Carga de datos
  // ─────────────────────────────────────────────────────────

  loadBooking(): void {
    this.loading = true;
    this.error   = '';

    // ── CORRECCIÓN: usar getBookingsByProviderNullable ──
    this.bookingService
      .getBookingsByProviderNullable(this.providerProfileId)
      .subscribe({
        next: (data) => {
          this.booking = data.find((b) => b.bookingId === this.bookingId) || null;
          if (!this.booking) this.error = 'No se encontró la solicitud.';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando solicitud:', err);
          this.error   = 'No se pudo cargar la solicitud.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ─────────────────────────────────────────────────────────
  // Navegación
  // ─────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/provider-requests-service', this.providerProfileId]);
  }

  navigateToStartService(): void {
    this.router.navigate(['/provider-start-service', this.bookingId]);
  }

  goToActiveService(): void {
    this.router.navigate(['/provider-in-service', this.bookingId]);
  }

  // ─────────────────────────────────────────────────────────
  // Modal acción
  // ─────────────────────────────────────────────────────────

  openConfirmModal(action: 'ACEPTAR' | 'RECHAZAR'): void {
    this.actionType       = action;
    this.showConfirmModal = true;
  }

  closeModal(): void {
    this.showConfirmModal = false;
    this.actionType       = null;
  }

  confirmAction(): void {
    if (!this.actionType || !this.booking) return;
    this.actionLoading = true;

    this.bookingService
      .respondToBooking(this.booking.bookingId, this.providerProfileId, {
        action: this.actionType,
        reason: this.actionType === 'RECHAZAR' ? 'Rechazado por el proveedor' : undefined,
      })
      .subscribe({
        next: () => {
          this.actionLoading = false;
          this.closeModal();
          this.loadBooking();
        },
        error: (err) => {
          console.error('Error respondiendo solicitud:', err);
          this.actionLoading = false;
          this.closeModal();
        },
      });
  }

  // ─────────────────────────────────────────────────────────
  // Helpers de UI
  // ─────────────────────────────────────────────────────────

  getStatusStyle(status: string): string {
    switch (status) {
      case 'PENDIENTE':  return 'bg-orange-100 text-orange-600';
      case 'ACEPTADA':   return 'bg-green-100 text-green-600';
      case 'EN_CURSO':   return 'bg-blue-100 text-blue-600';
      case 'COMPLETADA': return 'bg-purple-100 text-purple-600';
      case 'RECHAZADA':  return 'bg-gray-100 text-gray-600';
      default:           return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDIENTE':  return 'Pendiente';
      case 'ACEPTADA':   return 'Aceptada';
      case 'EN_CURSO':   return 'En curso';
      case 'COMPLETADA': return 'Completada';
      case 'RECHAZADA':  return 'Rechazada';
      default:           return status;
    }
  }

  formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('es-CR', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CR', {
      style: 'currency', currency: 'CRC',
    });
  }

  padId(id: number): string {
    return String(id).padStart(6, '0');
  }
}