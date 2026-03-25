import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProviderBookingService } from '../../services/provider-booking-service';
import { ServiceBookingResponse } from '../../interfaces/booking-model';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-start-service',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './provider-start-booking.html',
  styleUrls: ['./provider-start-booking.css'],
})
export class ProviderStartBooking implements OnInit {
  role: 'client' | 'admin' | 'provider' | null = 'provider';
  booking: ServiceBookingResponse | null = null;
  loading = true;
  error = '';
  shareLocation = false;
  startingService = false;

  providerProfileId = 6;
  bookingId = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: ProviderBookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBooking();
  }

  loadBooking(): void {
    this.loading = true;
    this.bookingService
      .getBookingsByProvider(this.providerProfileId)
      .subscribe({
        next: (data) => {
          this.booking = data.find((b) => b.bookingId === this.bookingId) || null;
          if (!this.booking) {
            this.error = 'No se encontró la solicitud.';
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando solicitud:', err);
          this.error = 'No se pudo cargar la solicitud.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/provider-booking-detail', this.bookingId]);
  }

  toggleLocation(): void {
    this.shareLocation = !this.shareLocation;
  }

handleBegin(): void {
    if (!this.booking) return;
    this.startingService = true;

    this.bookingService
      .startService(this.booking.bookingId, this.providerProfileId)
      .subscribe({
        next: () => {
          this.startingService = false;
          this.router.navigate(['/provider-in-service', this.bookingId], {
            state: { shareLocation: this.shareLocation },
          });
        },
        error: (err) => {
          console.error('Error iniciando servicio:', err);
          this.startingService = false;
        },
      });
}

  formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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