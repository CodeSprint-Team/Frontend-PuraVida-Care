import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUsers,
  heroClock,
  heroCheckBadge,
  heroFolderOpen,
  heroChartBar,
  heroPlus,
  heroDocumentText,
  heroCalendarDays,
  heroInbox,
  heroUser,
  heroChatBubbleLeft,
  heroCurrencyDollar
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroUsers,
      heroClock,
      heroCheckBadge,
      heroFolderOpen,
      heroChartBar,
      heroPlus,
      heroDocumentText,
      heroCalendarDays,
      heroInbox,
      heroUser,
      heroChatBubbleLeft,
      heroCurrencyDollar
    })
  ],
  templateUrl: './quick-actions.html'
})
export class QuickActions {
  @Input() role!: 'admin' | 'provider';

  constructor(private router: Router) {}

  adminActions = [
    { title: 'Aprobar proveedores', description: '8 pendientes', icon: 'heroCheckBadge', color: 'orange', route: '/admin/provider-requests' },
    { title: 'Gestionar categorías', description: 'Crear y editar categorías', icon: 'heroFolderOpen', color: 'purple', route: '/admin-dashboard' },
    { title: 'Configurar comisión', description: 'Ajustar porcentaje', icon: 'heroCurrencyDollar', color: 'blue', route: '/admin-dashboard' },
    { title: 'Ver reportes', description: 'Métricas y estadísticas', icon: 'heroChartBar', color: 'green', route: '/admin-dashboard' }
  ];

  providerActions = [
    { title: 'Crear servicio', description: 'Publicar nueva oferta', icon: 'heroPlus', color: 'green', route: '/provider-dashboard' },
    { title: 'Mis servicios', description: 'Ver y editar servicios', icon: 'heroDocument', color: 'blue', route: '/provider-dashboard' },
    { title: 'Disponibilidad', description: 'Gestionar calendario', icon: 'heroCalendar', color: 'purple', route: '/provider-dashboard' },
    { title: 'Solicitudes', description: 'Ver solicitudes', icon: 'heroInbox', color: 'orange', route: '/provider-dashboard' },
    { title: 'Perfil público', description: 'Ver como cliente', icon: 'heroUser', color: 'pink', route: '/provider-dashboard' },
    { title: 'Mensajes', description: 'Ver mensajes', icon: 'heroChatBubbleLeft', color: 'gray', route: '/provider-dashboard' }
  ];

  @Input() pendingCount: number = 0;

  get actions() {
    const admin = [
      { title: 'Aprobar proveedores', description: `${this.pendingCount} pendientes`, icon: 'heroCheckBadge', color: 'orange', route: '/admin/provider-requests' },
      { title: 'Gestionar categorías', description: 'Crear y editar categorías', icon: 'heroFolderOpen', color: 'purple', route: '/admin-dashboard' },
      { title: 'Configurar comisión', description: 'Ajustar porcentaje', icon: 'heroCurrencyDollar', color: 'blue', route: '/admin-dashboard' },
      { title: 'Ver reportes', description: 'Métricas y estadísticas', icon: 'heroChartBar', color: 'green', route: '/admin-dashboard' }
    ];
    return this.role === 'admin' ? admin : this.providerActions;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
