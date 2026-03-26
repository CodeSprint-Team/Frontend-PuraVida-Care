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
  @Input() pendingCount: number = 0;

  constructor(private router: Router) {}

  adminActions = [
    { title: 'Aprobar proveedores', description: '8 pendientes',           icon: 'heroCheckBadge',   color: 'orange', route: '/admin/provider-requests' },
    { title: 'Gestionar categorías', description: 'Crear y editar categorías', icon: 'heroFolderOpen', color: 'purple', route: '/admin-dashboard' },
    { title: 'Configurar comisión', description: 'Ajustar porcentaje',     icon: 'heroCurrencyDollar', color: 'blue',  route: '/admin-dashboard' },
    { title: 'Ver reportes',        description: 'Métricas y estadísticas', icon: 'heroChartBar',     color: 'green',  route: '/admin-dashboard' },
  ];

  get actions() {
    if (this.role === 'admin') {
      return [
        { title: 'Aprobar proveedores',  description: `${this.pendingCount} pendientes`, icon: 'heroCheckBadge',    color: 'orange', route: '/admin/provider-requests' },
        { title: 'Gestionar categorías', description: 'Crear y editar categorías',       icon: 'heroFolderOpen',    color: 'purple', route: '/admin-dashboard'         },
        { title: 'Configurar comisión',  description: 'Ajustar porcentaje',              icon: 'heroCurrencyDollar', color: 'blue',  route: '/admin-dashboard'         },
        { title: 'Ver reportes',         description: 'Métricas y estadísticas',         icon: 'heroChartBar',      color: 'green',  route: '/admin-dashboard'         },
      ];
    }
    return this.providerActions;
  }

  providerActions = [
    { title: 'Crear servicio',  description: 'Publicar nueva oferta', icon: 'heroPlus',           color: 'green',  route: '/provider-dashboard' },
    { title: 'Mis servicios',   description: 'Ver y editar servicios', icon: 'heroDocumentText',  color: 'blue',   route: '/provider-dashboard' },
    { title: 'Disponibilidad',  description: 'Gestionar calendario',  icon: 'heroCalendarDays',   color: 'purple', route: '/provider-dashboard' },
    { title: 'Solicitudes',     description: 'Ver solicitudes',       icon: 'heroInbox',           color: 'orange', route: '/provider-requests-service' },
    { title: 'Perfil público',  description: 'Ver como cliente',      icon: 'heroUser',            color: 'pink',   route: '/provider-dashboard' },
    { title: 'Mensajes',        description: 'Ver mensajes',          icon: 'heroChatBubbleLeft',  color: 'gray',   route: '/provider-dashboard' }
  ];

    profileId = '';

    ngOnInit(): void {
      this.profileId = localStorage.getItem('profile_id') ?? '';
    }

    navigate(route: string): void {
      if (route === '/provider-requests-service') {
        this.router.navigate(['/provider-requests-service', this.profileId]);
      } else {
        this.router.navigate([route]);
      }
    }
}
