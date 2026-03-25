import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { StatsCards } from '../../components/stats-cards/stats-cards';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { BookingService } from '../solicitudes/services/booking';
import { ProfileService } from '../viewProfile/services/profile.services';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, StatsCards, QuickActions],
  templateUrl: './provider-dashboard.html',
  styleUrl: './provider-dashboard.css'
})
export class ProviderDashboard implements OnInit {
  private bookingService = inject(BookingService);
  private profileService = inject(ProfileService);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);

  role: 'admin' | 'provider' = 'provider';

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);

  providerProfileId = 0;
  pendingCount      = 0;
  totalCount        = 0;
  acceptedCount     = 0;
  loaded            = false;

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('user_id') ?? '0');

    if (userId > 0) {
      this.profileService.getProviderProfileByUserId(userId).subscribe({
        next: (profile) => {
          this.providerProfileId = profile.id;
          localStorage.setItem('profileId', String(profile.id));
          this.loadStats();
        },
        error: () => {
          this.loaded = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loaded = true;
    }
  }

  private loadStats(): void {
    this.bookingService.getBookingsByProvider(this.providerProfileId).subscribe({
      next: (bookings) => {
        this.totalCount    = bookings.length;
        this.pendingCount  = bookings.filter(b => b.bookingStatus === 'pending').length;
        this.acceptedCount = bookings.filter(b => b.bookingStatus === 'accepted').length;
        this.loaded        = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  goToSolicitudes(): void {
    this.router.navigate(['/proveedor/solicitudes', this.providerProfileId]);
  }

  goToProfile(): void {
    const userId = localStorage.getItem('user_id') ?? '0';
    this.router.navigate(['/provider-profile', userId]);
  }
}