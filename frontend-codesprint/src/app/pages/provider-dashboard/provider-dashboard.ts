import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementNavbar } from '../../components/management-navbar/management-navbar';
import { StatsCards } from '../../components/stats-cards/stats-cards';
import { QuickActions } from '../../components/quick-actions/quick-actions';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, ManagementNavbar, StatsCards, QuickActions],
  templateUrl: './provider-dashboard.html',
  styleUrl: './provider-dashboard.css'
})
export class ProviderDashboard {
  role: 'admin' | 'provider' = 'provider';
}
