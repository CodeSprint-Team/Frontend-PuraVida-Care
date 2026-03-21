/*
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { StatsCards } from '../../components/stats-cards/stats-cards';
import { QuickActions } from '../../components/quick-actions/quick-actions';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, StatsCards, QuickActions],
  templateUrl: './provider-dashboard.html',
  styleUrl: './provider-dashboard.css'
})
export class ProviderDashboard {
  role: 'admin' | 'provider' = 'provider';
}
*/

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { StatsCards } from '../../components/stats-cards/stats-cards';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { BookingService } from '../solicitudes/services/booking';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, StatsCards, QuickActions],
  templateUrl: './provider-dashboard.html',
  styleUrl: './provider-dashboard.css'
})
export class ProviderDashboard implements OnInit {
  private bookingService = inject(BookingService);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef); // ✅

  role: 'admin' | 'provider' = 'provider';
  providerProfileId = 0;
  pendingCount      = 0;
  totalCount        = 0;
  acceptedCount     = 0;
  loaded            = false;

  ngOnInit(): void {
    localStorage.setItem('profileId', '2');

    this.providerProfileId = Number(localStorage.getItem('profileId') ?? '0');

    if (this.providerProfileId > 0) {
      this.loadStats();
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
        this.cdr.detectChanges(); // ✅ fuerza actualización del StatsCards
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
    this.router.navigate(['/provider-profile', this.providerProfileId]);
  }
}