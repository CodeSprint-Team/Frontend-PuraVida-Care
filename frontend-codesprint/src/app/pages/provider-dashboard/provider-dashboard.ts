import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { StatsCards } from '../../components/stats-cards/stats-cards';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { ProviderBookingService } from '../../services/provider-booking-service';
import { ProfileService } from '../viewProfile/services/profile.services';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, StatsCards, QuickActions],
  templateUrl: './provider-dashboard.html',
  styleUrl: './provider-dashboard.css',
})
export class ProviderDashboard implements OnInit {
  private bookingService = inject(ProviderBookingService);
  private profileService = inject(ProfileService);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);

  role: 'admin' | 'provider' = 'provider';
  providerProfileId = 0;
  pendingCount      = 0;
  totalCount        = 0;
  acceptedCount     = 0;
  loaded            = false;

  ngOnInit(): void {
    const storedProfileId = Number(localStorage.getItem('profile_id') ?? 0);

    if (storedProfileId > 0) {
      this.providerProfileId = storedProfileId;
      this.loadStats();
    } else {
      const userId = localStorage.getItem('user_id') ?? '0';
      if (Number(userId) > 0) {
        this.profileService.getProviderProfileByUserId(userId).subscribe({
          next: (profile) => {
            this.providerProfileId = profile.id;
            localStorage.setItem('profile_id', String(profile.id));
            this.loadStats();
          },
          error: () => {
            this.loaded = true;
            this.cdr.detectChanges();
          },
        });
      } else {
        this.loaded = true;
      }
    }
  }

  private loadStats(): void {
    this.bookingService.getBookingsByProvider(this.providerProfileId).subscribe({
      next: (bookings) => {
        this.totalCount    = bookings.length;
        this.pendingCount  = bookings.filter(b => b.bookingStatus === 'PENDIENTE').length;
        this.acceptedCount = bookings.filter(b => b.bookingStatus === 'ACEPTADA').length;
        this.loaded        = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Navegación ────────────────────────────────────────────────────────────

  goToSolicitudes(): void {
    this.router.navigate(['/provider-requests-service', this.providerProfileId]);
  }

  goToProfile(): void {
    const userId = localStorage.getItem('user_id') ?? '0';
    this.router.navigate(['/provider-profile', userId]);
  }

  goToFilteredHome(bookingId: number): void {
    this.router.navigate(['/filtered-home'], {
      queryParams: { bookingId },
    });
  }
}