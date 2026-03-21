// src/app/solicitudes/solicitudes-proveedor/solicitudes-proveedor.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroFunnel, heroClock, heroUser,
  heroCheckCircle, heroXCircle, heroExclamationTriangle
} from '@ng-icons/heroicons/outline';
import { BookingService } from '../services/booking';
import { Booking } from '../Models/Booking.model';
import { NavbarComponent } from '../../../components/navbar/navbar';

@Component({
  selector: 'app-solicitudes-proveedor',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroFunnel, heroClock, heroUser,
    heroCheckCircle, heroXCircle, heroExclamationTriangle
  })],
  templateUrl: './solicitudes-proveedor.html',
  styleUrl: './solicitudes-proveedor.css',
})
export class SolicitudesProveedorComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private cdr            = inject(ChangeDetectorRef);

  bookings: Booking[] = [];
  filtered: Booking[] = [];
  filterStatus        = 'all';
  providerProfileId   = 0;
  errorMessage        = '';
  loaded              = false;

  ngOnInit(): void {
    this.providerProfileId = Number(
      this.route.snapshot.paramMap.get('id') ?? '1'
    );
    this.loadBookings();
  }

  loadBookings(): void {
    this.errorMessage = '';
    this.loaded       = false;
    this.bookingService.getBookingsByProvider(this.providerProfileId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.filtered = data;
        this.loaded   = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las solicitudes.';
        this.loaded       = true;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(status: string): void {
    this.filterStatus = status;
    this.filtered = status === 'all'
      ? this.bookings
      : this.bookings.filter(b => b.bookingStatus === status);
  }

  // ✅ Pasa el providerProfileId como query param para que el detalle sepa volver
  goToDetail(bookingId: number): void {
    this.router.navigate(['/proveedor/solicitud', bookingId], {
      queryParams: { provider: this.providerProfileId }
    });
  }

  // ✅ Vuelve al dashboard del proveedor
  goBack(): void {
    this.router.navigate(['/provider-dashboard']);
  }

  // ── Contadores ────────────────────────────────────────────────
  get pendingCount():  number { return this.bookings.filter(b => b.bookingStatus === 'pending').length; }
  get acceptedCount(): number { return this.bookings.filter(b => b.bookingStatus === 'accepted').length; }
  get rejectedCount(): number { return this.bookings.filter(b => b.bookingStatus === 'rejected').length; }

  // ── Helpers de UI ─────────────────────────────────────────────
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending:  'Pendiente',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
    };
    return labels[status] ?? status;
  }

  getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      pending:  'bg-orange-100 text-orange-600',
      accepted: 'bg-green-100  text-green-700',
      rejected: 'bg-gray-100   text-gray-600',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-600';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CR', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  formatRequestDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatPrice(price: number, mode: string): string {
    return `₡ ${price.toLocaleString('es-CR')}${mode === 'hourly' ? ' / hora' : ''}`;
  }
}