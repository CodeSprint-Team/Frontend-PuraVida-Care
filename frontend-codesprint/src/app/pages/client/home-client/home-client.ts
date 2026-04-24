import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroTruck, heroUserPlus, heroHeart, heroVideoCamera,
  heroShoppingBag, heroClock, heroSparkles, heroBolt,
  heroCheckCircle, heroXCircle, heroMapPin,
} from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../../components/navbar/navbar';

interface Category {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  iconColor: string;
  path: string;
  featured?: boolean;
  /** Si true, la navegación pasa por navigateToMap() en vez de navigateTo() */
  isMap?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroTruck, heroUserPlus, heroHeart, heroVideoCamera,
    heroShoppingBag, heroClock, heroSparkles, heroBolt,
    heroCheckCircle, heroXCircle, heroMapPin,
  })],
  templateUrl: './home-client.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  showNotification = false;
  notificationMessage = '';
  private notifTimer: any;

  userRole: 'client' | 'admin' | 'provider' | 'senior' | null = null;
  userName = '';

  categories: Category[] = [
    {
      id: 'transporte',
      icon: 'heroTruck',
      title: 'Transporte seguro',
      description: 'Traslados confiables para citas y diligencias',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/explorar',
    },
    {
      id: 'transporte-acompanante',
      icon: 'heroUserPlus',
      title: 'Transporte + Acompañante',
      description: 'Traslado con asistencia personalizada',
      color: 'bg-teal-50',
      iconColor: 'text-teal-600',
      path: '/explorar',
      featured: true,
    },
    {
      id: 'enfermeria',
      icon: 'heroHeart',
      title: 'Enfermería / Cuidador',
      description: 'Atención profesional en casa',
      color: 'bg-pink-50',
      iconColor: 'text-pink-600',
      path: '/home-filter',
      isMap: true,
    },
    {
      id: 'telemedicina',
      icon: 'heroVideoCamera',
      title: 'Telemedicina',
      description: 'Consultas médicas virtuales',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/explorar',
    },
    {
      id: 'compras',
      icon: 'heroShoppingBag',
      title: 'Compras asistidas',
      description: 'Ayuda con compras y mandados',
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      path: '/explorar',
    },
    {
      id: 'bienes-apoyo',
      icon: 'heroBolt',
      title: 'Bienes de apoyo',
      description: 'Sillas, camas, equipos médicos nuevos y usados',
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      path: 'support-products',
      featured: true,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('user_role')?.toLowerCase();
    if (raw === 'client' || raw === 'senior' || raw === 'provider' || raw === 'admin') {
      this.userRole = raw;
    } else {
      this.userRole = 'client';
    }

    this.userName = localStorage.getItem('user_name') ?? '';

    const nav   = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { message?: string } | undefined;
    if (state?.message) {
      this.triggerNotification(state.message);
    }
  }

  ngOnDestroy(): void {
    if (this.notifTimer) clearTimeout(this.notifTimer);
  }

  private triggerNotification(msg: string): void {
    this.notificationMessage = msg;
    this.showNotification    = true;
    this.notifTimer = setTimeout(() => (this.showNotification = false), 5000);
  }

  dismissNotification(): void {
    this.showNotification = false;
  }

  /**
   * Navegación genérica para la mayoría de categorías.
   */
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Navegación al mapa del hogar.
   * Pasa el bookingId activo si existe en localStorage,
   * para que HomeMapPageComponent precargue los marcadores correctos.
   */
  navigateToMap(): void {
    this.router.navigate(['/home-filter']);
  }

  /**
   * Despacha la navegación correcta según el tipo de categoría.
   * Usada por el template para no duplicar lógica en el HTML.
   */
  onCategoryClick(category: Category): void {
    if (category.isMap) {
      this.navigateToMap();
    } else {
      this.navigateTo(category.path);
    }
  }

  navigateToAI(): void {
    this.router.navigate(['/chat-ia']);
  }
}