import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroStar, heroCheckBadge, heroClock,
  heroUserCircle, heroBriefcase
} from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../components/navbar/navbar';
import { environment } from '../../../environments/environment';

interface CompletedBooking {
  bookingId: number;
  bookingStatus: string;
  scheduledAt: string;
  careServiceId: number;
  serviceTitle: string;
  agreedPrice: number;
  agreedPriceMode: string;
  providerProfileId: number;
  providerName: string;
  providerProfileImage: string | null;
}

@Component({
  selector: 'app-my-completed-services',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NavbarComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroStar, heroCheckBadge, heroClock,
    heroUserCircle, heroBriefcase
  })],
  templateUrl: './my-completed-services.html',
  styleUrl: './my-completed-services.css',
})
export class MyCompletedServicesComponent implements OnInit {
  private router = inject(Router);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);

  bookings: CompletedBooking[] = [];
  loading = true;
  errorMessage = '';
  userRole = '';

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role') ?? '';
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.errorMessage = '';

    const profileId = localStorage.getItem('profile_id') ?? '';
    const role = this.userRole;

    let url = '';
    if (role === 'CLIENT') {
      url = `${environment.apiUrl}/bookings/client/${profileId}/completed`;
    } else if (role === 'SENIOR') {
      url = `${environment.apiUrl}/bookings/senior/${profileId}/completed`;
    } else {
      this.errorMessage = 'Rol no válido para ver servicios.';
      this.loading = false;
      return;
    }

    this.http.get<CompletedBooking[]>(url).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los servicios.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

    goToReview(booking: CompletedBooking): void {
      this.router.navigate(['/create-review', booking.providerProfileId], {
        queryParams: {
          bookingId: booking.bookingId,
          serviceTitle: booking.serviceTitle,
          providerName: booking.providerName
        }
      });
    }
  goBack(): void {
    const userId = localStorage.getItem('user_id') ?? '';
    if (this.userRole === 'CLIENT') {
      this.router.navigate(['/family-profile', userId]);
    } else {
      this.router.navigate(['/profile', userId]);
    }
  }

  formatPrice(price: number, mode: string): string {
    const formatted = `₡ ${price?.toLocaleString('es-CR') ?? '0'}`;
    return mode === 'hourly' || mode === 'POR_HORA'
      ? `${formatted} / hora`
      : `${formatted} / servicio`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? '';
  }
}