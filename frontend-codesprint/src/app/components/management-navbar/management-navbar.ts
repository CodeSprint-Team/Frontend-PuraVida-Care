import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-management-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './management-navbar.html'
})
export class ManagementNavbar {
  @Input() role!: 'admin' | 'provider';

  adminNav = [
    { label: 'Home', route: '/admin-dashboard' },
    { label: 'Perfil', route: '/admin-profile' }
  ];

  providerNav = [
    { label: 'Dashboard', route: '/provider-dashboard' },
    { label: 'Mensajes', route: '/provider-messages' },
    { label: 'Perfil', route: '/provider-profile' },
    { label: 'Agenda', route: '/provider-agenda' }
  ];

  get navItems() {
    return this.role === 'admin' ? this.adminNav : this.providerNav;
  }
}
