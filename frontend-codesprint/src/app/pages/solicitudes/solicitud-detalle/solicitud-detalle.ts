// src/app/solicitudes/solicitud-detalle/solicitud-detalle.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroUser, heroClock, heroCurrencyDollar,
  heroCheckCircle, heroXCircle, heroExclamationTriangle,
  heroPhone, heroCalendarDays
} from '@ng-icons/heroicons/outline';
import { BookingService } from '../services/booking';
import { Booking } from '../models/Booking.model';
import { NavbarComponent } from '../../../components/navbar/navbar';

@Component({
  selector: 'app-solicitud-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroUser, heroClock, heroCurrencyDollar,
    heroCheckCircle, heroXCircle, heroExclamationTriangle,
    heroPhone, heroCalendarDays
  })],
  templateUrl: './solicitud-detalle.html',
  styleUrl: './solicitud-detalle.css',
})
export class SolicitudDetalleComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private cdr            = inject(ChangeDetectorRef);

  booking: Booking | null = null;
  errorMessage       = '';
  bookingId          = 0;
  providerProfileId  = 0;  // ✅ viene como query param desde la lista

  // ── Rechazo ───────────────────────────────────────────────────
  showRejectModal  = false;
  rejectionReason  = '';
  isSubmitting     = false;
  actionStatus: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };

  ngOnInit(): void {
    this.bookingId         = Number(this.route.snapshot.paramMap.get('id') ?? '0');
    // ✅ Lee el providerProfileId del query param para poder volver correctamente
    this.providerProfileId = Number(this.route.snapshot.queryParamMap.get('provider') ?? '1');
    this.loadDetail();
  }

  loadDetail(): void {
    this.bookingService.getBookingDetail(this.bookingId).subscribe({
      next: (data) => {
        this.booking = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle de la solicitud.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Aceptar ───────────────────────────────────────────────────
  accept(): void {
    this.isSubmitting = true;
    this.bookingService.updateBookingStatus(this.bookingId, { status: 'accepted' })
      .subscribe({
        next: (updated) => {
          this.booking      = updated;
          this.isSubmitting = false;
          this.showStatus('Solicitud aceptada correctamente.', 'success');
          this.cdr.detectChanges();
        },
        error: () => {
          this.isSubmitting = false;
          this.showStatus('Error al aceptar la solicitud.', 'error');
          this.cdr.detectChanges();
        }
      });
  }

  // ── Rechazar ──────────────────────────────────────────────────
  openRejectModal(): void  { this.showRejectModal = true; }
  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectionReason = '';
  }

  confirmReject(): void {
    this.isSubmitting = true;
    this.bookingService.updateBookingStatus(this.bookingId, {
      status: 'rejected',
      rejectionReason: this.rejectionReason.trim() || undefined
    }).subscribe({
      next: (updated) => {
        this.booking         = updated;
        this.isSubmitting    = false;
        this.showRejectModal = false;
        this.rejectionReason = '';
        this.showStatus('Solicitud rechazada.', 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        this.showStatus('Error al rechazar la solicitud.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ Vuelve a la lista correcta del proveedor
  goBack(): void {
    this.router.navigate(['/proveedor/solicitudes', this.providerProfileId]);
  }

  // ── Helpers ───────────────────────────────────────────────────
  private showStatus(text: string, type: 'success' | 'error'): void {
    this.actionStatus = { text, type };
    setTimeout(() => this.actionStatus = { text: '', type: null }, 4000);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending:  'Pendiente',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
    };
    return labels[status] ?? status;
  }

  getStatusClasses(status: string): string {
    return {
      pending:  'bg-orange-100 text-orange-600',
      accepted: 'bg-green-100  text-green-700',
      rejected: 'bg-red-100    text-red-600',
    }[status] ?? 'bg-gray-100 text-gray-600';
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-CR', {
      weekday: 'long', day: 'numeric', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  formatPrice(price: number, mode: string): string {
    return `₡ ${price.toLocaleString('es-CR')}${mode === 'hourly' ? ' / hora' : ''}`;
  }
}