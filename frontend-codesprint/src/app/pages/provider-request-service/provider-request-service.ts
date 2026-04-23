import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProviderBookingService } from '../../services/provider-booking-service';
import { ServiceBookingResponse } from '../../interfaces/booking-model';
import { NavbarComponent } from '../../components/navbar/navbar';

type FilterStatus =
  | 'all'
  | 'PENDIENTE'
  | 'EN_CURSO'
  | 'RECHAZADA'
  | 'COMPLETADA'
  | 'ACEPTADA'
  | 'CANCELADA'
  | 'CANCELADO';

@Component({
  selector: 'app-provider-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './provider-request-service.html',
  styleUrls: ['./provider-request-service.css'],
})
export class ProviderRequestsComponent implements OnInit {
  role: 'client' | 'admin' | 'provider' | null = 'provider';
  filterStatus: FilterStatus = 'all';
  requests: ServiceBookingResponse[] = [];
  loading = true;
  error = '';

  providerProfileId = 0;

  showCancelModal = false;
  selectedBookingId: number | null = null;
  cancelReason = '';
  processingCancel = false;

  filters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'ACEPTADA', label: 'Aceptadas' },
    { value: 'EN_CURSO', label: 'En curso' },
    { value: 'COMPLETADA', label: 'Completadas' },
    { value: 'RECHAZADA', label: 'Rechazadas' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: ProviderBookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.providerProfileId = routeId
      ? Number(routeId)
      : Number(localStorage.getItem('profile_id') ?? 0);

    if (this.providerProfileId) {
      this.loadRequests();
    } else {
      this.error = 'No se pudo identificar el proveedor.';
      this.loading = false;
    }
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    const statusParam = this.filterStatus === 'all' ? undefined : this.filterStatus;

    this.bookingService
      .getBookingsByProvider(this.providerProfileId, statusParam)
      .subscribe({
        next: (data) => {
          this.requests = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando solicitudes:', err);
          this.error = 'No se pudieron cargar las solicitudes. Intentá de nuevo.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  get filteredRequests(): ServiceBookingResponse[] {
    if (this.filterStatus === 'all') {
      return this.requests;
    }
    return this.requests.filter(
      (r) => (r.bookingStatus || '').toUpperCase() === this.filterStatus
    );
  }

  get pendingCount(): number {
    return this.requests.filter((r) => (r.bookingStatus || '').toUpperCase() === 'PENDIENTE').length;
  }

  get acceptedCount(): number {
    return this.requests.filter((r) => (r.bookingStatus || '').toUpperCase() === 'ACEPTADA').length;
  }

  get inProgressCount(): number {
    return this.requests.filter((r) => (r.bookingStatus || '').toUpperCase() === 'EN_CURSO').length;
  }

  get completedCount(): number {
    return this.requests.filter((r) => {
      const status = (r.bookingStatus || '').toUpperCase();
      return status === 'COMPLETADA' || status === 'COMPLETADO';
    }).length;
  }

  get rejectedCount(): number {
    return this.requests.filter((r) => (r.bookingStatus || '').toUpperCase() === 'RECHAZADA').length;
  }

  setFilter(status: FilterStatus): void {
    this.filterStatus = status;
    this.loadRequests();
  }

  goBack(): void {
    this.router.navigate(['/provider-dashboard']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/provider-booking-detail', id]);
  }

  acceptRequest(id: number, event: Event): void {
    event.stopPropagation();
    this.bookingService
      .respondToBooking(id, this.providerProfileId, { action: 'ACEPTAR' })
      .subscribe({
        next: () => this.loadRequests(),
        error: (err) => console.error('Error aceptando solicitud:', err),
      });
  }

  rejectRequest(id: number, event: Event): void {
    event.stopPropagation();
    this.bookingService
      .respondToBooking(id, this.providerProfileId, {
        action: 'RECHAZAR',
        reason: 'Rechazado por el proveedor',
      })
      .subscribe({
        next: () => this.loadRequests(),
        error: (err) => console.error('Error rechazando solicitud:', err),
      });
  }

  startService(id: number, event: Event): void {
    event.stopPropagation();
    this.bookingService
      .startService(id, this.providerProfileId)
      .subscribe({
        next: () => this.loadRequests(),
        error: (err) => console.error('Error iniciando servicio:', err),
      });
  }

  canShowCancelButton(status: string): boolean {
    const normalized = (status || '').toUpperCase();
    return (
      normalized !== 'CANCELADA' &&
      normalized !== 'CANCELADO' &&
      normalized !== 'COMPLETADA' &&
      normalized !== 'COMPLETADO' &&
      normalized !== 'RECHAZADA'  &&
      normalized !== 'RECHAZADO'
    );
  }

  openCancelModal(id: number, event: Event): void {
    event.stopPropagation();
    this.selectedBookingId = id;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    if (this.processingCancel) return;
    this.showCancelModal = false;
    this.selectedBookingId = null;
    this.cancelReason = '';
  }

  confirmCancelBooking(): void {
    if (!this.selectedBookingId || !this.providerProfileId) return;

    if (!this.cancelReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes indicar la razón de la cancelación.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    this.processingCancel = true;

    this.bookingService
      .cancelBooking(this.selectedBookingId, this.providerProfileId, {
        cancellationReason: this.cancelReason.trim(),
      })
      .subscribe({
        next: () => {
          this.processingCancel = false;
          this.showCancelModal = false;
          this.cancelReason = '';
          this.selectedBookingId = null;

          Swal.fire({
            icon: 'success',
            title: 'Reserva cancelada',
            text: 'La reserva fue cancelada correctamente.',
            confirmButtonColor: '#14b8a6',
          });

          this.loadRequests();
        },
        error: (err) => {
          console.error('Error cancelando:', err);
          this.processingCancel = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cancelar la reserva.',
            confirmButtonColor: '#ef4444',
          });
        },
      });
  }

  getStatusStyle(status: string): string {
    const normalized = (status || '').toUpperCase();

    switch (normalized) {
      case 'PENDIENTE':
        return 'bg-orange-100 text-orange-600';
      case 'ACEPTADA':
        return 'bg-green-100 text-green-600';
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-600';
      case 'COMPLETADA':
      case 'COMPLETADO':
        return 'bg-purple-100 text-purple-600';
      case 'RECHAZADA':
        return 'bg-gray-100 text-gray-600';
      case 'CANCELADA':
      case 'CANCELADO':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusText(status: string): string {
    const normalized = (status || '').toUpperCase();

    switch (normalized) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ACEPTADA':
        return 'Aceptada';
      case 'EN_CURSO':
        return 'En curso';
      case 'COMPLETADA':
      case 'COMPLETADO':
        return 'Completada';
      case 'RECHAZADA':
        return 'Rechazada';
      case 'CANCELADA':
      case 'CANCELADO':
        return 'Cancelada';
      default:
        return status;
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
    });
  }
}