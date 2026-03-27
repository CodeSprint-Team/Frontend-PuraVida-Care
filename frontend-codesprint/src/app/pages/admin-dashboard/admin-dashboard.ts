import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { StatsCards } from '../../components/stats-cards/stats-cards';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { AdminService, ProviderPending } from '../../services/admin';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, StatsCards, QuickActions],

  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  role: 'admin' | 'provider' = 'admin';
  pendingProviders: ProviderPending[] = [];
  selectedProvider: ProviderPending | null = null;
  rejectionReason = '';
  showModal = false;
  actionType: 'approve' | 'reject' = 'approve';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPendingProviders();
  }

  pendingCount: number = 0;

  loadPendingProviders(): void {
    this.adminService.getPendingProviders().subscribe({
      next: (data: ProviderPending[]) => {
        this.pendingProviders = data;
        this.pendingCount = data.length;
      },
      error: (err: Error) => console.error(err)
    });
  }

  openModal(provider: ProviderPending, action: 'approve' | 'reject'): void {
    this.selectedProvider = provider;
    this.actionType = action;
    this.rejectionReason = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProvider = null;
  }

  confirmAction(): void {
    if (!this.selectedProvider) return;
    this.adminService.reviewProvider(this.selectedProvider.providerProfileId, {
      action: this.actionType,
      rejectionReason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.closeModal();
        this.loadPendingProviders();
      },
      error: (err: Error) => console.error('Error procesando acción', err)
    });
  }
}
