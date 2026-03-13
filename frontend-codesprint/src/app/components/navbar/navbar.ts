import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroHome, heroMagnifyingGlass, heroCalendarDays,
  heroCpuChip, heroChatBubbleLeftRight, heroUser
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
    heroCpuChip, heroChatBubbleLeftRight, heroUser
  })],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  navItems: NavItem[] = [
    { label: 'Home',     path: '/home',      icon: 'heroHome' },
    { label: 'Explorar', path: '/explorar',  icon: 'heroMagnifyingGlass' },
    { label: 'Agenda',   path: '/agenda',    icon: 'heroCalendarDays' },
    { label: 'Chat IA',  path: '/chat-ia',   icon: 'heroCpuChip' },
    { label: 'Mensajes', path: '/mensajes',  icon: 'heroChatBubbleLeftRight' },
    { label: 'Perfil',   path: '/profile',    icon: 'heroUser' },
  ];
}