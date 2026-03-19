import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagementNavbar } from '../../components/management-navbar/management-navbar';
import { AdminService, ProviderPending } from '../../services/admin';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroUser,
  heroCheckCircle,
  heroXCircle,
  heroClock,
  heroMapPin,
  heroPhone,
  heroEnvelope,
  heroBriefcase
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-provider-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ManagementNavbar, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroArrowLeft,
      heroUser,
      heroCheckCircle,
      heroXCircle,
      heroClock,
      heroMapPin,
      heroPhone,
      heroEnvelope,
      heroBriefcase
    })
  ],
  templateUrl: './provider-requests.html',
  styleUrl: './provider-requests.css'
})
export class ProviderRequests implements OnInit {
  role: 'admin' | 'provider' = 'admin';
  providers: ProviderPending[] = [];
  selectedProvider: ProviderPending | null = null;
  showRejectModal = false;
  rejectionReason = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.adminService.getPendingProviders().subscribe({
      next: (data: ProviderPending[]) => {
        this.providers = [...data];
        this.selectedProvider = data.length > 0 ? data[0] : null;
        this.cdr.detectChanges();
      },
      error: (err: Error) => console.error('ERROR:', err)
    });
  }

  selectProvider(provider: ProviderPending): void {
    this.selectedProvider = provider;
    this.cdr.detectChanges();
  }

  approve(): void {
    if (!this.selectedProvider) return;
    this.adminService.reviewProvider(this.selectedProvider.providerProfileId, {
      action: 'approve'
    }).subscribe({
      next: () => this.loadProviders(),
      error: (err: Error) => console.error(err)
    });
  }

  openRejectModal(): void {
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.selectedProvider) return;
    this.adminService.reviewProvider(this.selectedProvider.providerProfileId, {
      action: 'reject',
      rejectionReason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.showRejectModal = false;
        this.loadProviders();
      },
      error: (err: Error) => console.error(err)
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
