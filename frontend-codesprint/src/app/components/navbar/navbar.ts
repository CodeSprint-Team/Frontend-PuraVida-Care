import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroHome, heroMagnifyingGlass, heroCalendarDays,
  heroCpuChip, heroChatBubbleLeftRight, heroUser,
  heroCog6Tooth, heroClipboardDocumentList
} from '@ng-icons/heroicons/outline';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, NgIconComponent],
  viewProviders: [provideIcons({
    heroHome, heroMagnifyingGlass, heroCalendarDays,
    heroCpuChip, heroChatBubbleLeftRight, heroUser,
    heroCog6Tooth, heroClipboardDocumentList
  })],
  templateUrl: './navbar.html',
})

export class NavbarComponent implements OnInit, OnChanges {
  @Input() role: 'client' | 'admin' | 'provider' | 'senior' | null = null;
  navItems: NavItem[] = [];
  panelLabel = '';

  private readonly clientNav: NavItem[] = [
    { label: 'Inicio',   path: '/home',     icon: 'heroHome' },
    { label: 'Explorar', path: '/explorar', icon: 'heroMagnifyingGlass' },
    { label: 'Agenda',   path: '/agenda-cliente',   icon: 'heroCalendarDays' },
    { label: 'Chat IA',  path: '/chat-ia',  icon: 'heroCpuChip' },
    { label: 'Mensajes', path: '/mensajes', icon: 'heroChatBubbleLeftRight' },
  ];

  ngOnInit(): void {
    this.resolveRole();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role']) {
      this.resolveRole();
    }
  }

  private resolveRole(): void {
    const currentRole = this.role
      ?? localStorage.getItem('user_role')?.toLowerCase() as any
      ?? 'client';
    this.loadNav(currentRole);
  }

  private loadNav(role: string): void {
    const userId = localStorage.getItem('user_id') ?? '1';

    switch (role) {
      case 'admin':
        this.navItems = [
          { label: 'Dashboard', path: '/admin-dashboard', icon: 'heroCog6Tooth' },
          { label: 'Perfil',    path: `/admin-profile/${userId}`, icon: 'heroUser' },
        ];
        this.panelLabel = 'Panel Admin';
        break;

      case 'provider':
        this.navItems = [
          { label: 'Dashboard', path: '/provider-dashboard',       icon: 'heroClipboardDocumentList' },
          { label: 'Mensajes',  path: '/mensajes',                 icon: 'heroChatBubbleLeftRight'   },
          { label: 'Agenda',    path: '/provider-agenda',          icon: 'heroCalendarDays'          },
          { label: 'Perfil',    path: `/provider-profile/${userId}`, icon: 'heroUser'                },
        ];
        this.panelLabel = 'Panel Proveedor';
        break;

      case 'senior':
        this.navItems = [
          { label: 'Inicio',   path: '/home',     icon: 'heroHome'                },
          { label: 'Explorar', path: '/explorar', icon: 'heroMagnifyingGlass'     },
          { label: 'Agenda',   path: '/agenda',   icon: 'heroCalendarDays'        },
          { label: 'Mensajes', path: '/mensajes', icon: 'heroChatBubbleLeftRight' },
          { label: 'Perfil',   path: `/profile/${userId}`, icon: 'heroUser'       },
        ];
        this.panelLabel = '';
        break;

      case 'client':
      default:
        this.navItems = [
          ...this.clientNav,
          { label: 'Perfil', path: `/family-profile/${userId}`, icon: 'heroUser' },
        ];
        this.panelLabel = '';
        break;
    }
  }
}


