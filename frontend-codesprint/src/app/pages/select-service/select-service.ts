import {
  Component, OnInit, inject,
  signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProviderProfile } from '../viewProfile/models/provider-profile.model';
import { ProfileService } from '../../services/profile/profile';
import { NavbarComponent } from '../../components/navbar/navbar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroCheck, heroClock
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-select-service',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgIcon],
  viewProviders: [provideIcons({ heroArrowLeft, heroCheck, heroClock })],
  templateUrl: './select-service.html',
  styleUrls: ['./select-service.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectService implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private profileService = inject(ProfileService);

  provider         = signal<ProviderProfile | null>(null);
  errorMessage     = signal('');
  selectedServiceId = signal<number | string | null>(null);
  selectedService   = signal<any>(null);

  providerId!: string;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.providerId = params['providerId'];
      if (this.providerId) {
        this.loadProvider();
      } else {
        this.errorMessage.set('No se recibió el proveedor.');
      }
    });
  }

  loadProvider(): void {
    this.profileService.getProviderProfile(this.providerId).subscribe({
      next: (res) => this.provider.set(res),
      error: () => this.errorMessage.set('Error al cargar los servicios del proveedor.')
    });
  }

  selectService(service: any): void {
    this.selectedServiceId.set(service.id);
    this.selectedService.set(service);
  }

  // Detecta si un servicio es telemedicina (para mostrar badge en la lista)
  isTelemedicine(service: any): boolean {
    const name = (service.name ?? service.title ?? '').toLowerCase();
    const cat  = (service.category ?? service.categoryName ?? '').toLowerCase();
    return name.includes('telemedicina') || cat.includes('telemedicina');
  }

  getPriceLabelFromMode(mode: string): string {
    const m = (mode ?? '').toUpperCase();
    if (m.includes('DAY'))     return '/ día';
    if (m.includes('SERVICE')) return '/ servicio';
    return '/ hora';
  }

  get services() {
  return this.provider()?.services ?? [];
}

  formatPrice(price: string | number): string {
    const num = typeof price === 'string'
      ? parseFloat(price.replace(/[^0-9.]/g, ''))
      : price;
    return isNaN(num) ? String(price) : num.toLocaleString('es-CR');
  }

  continuar(): void {
    if (!this.selectedServiceId()) return;
    this.router.navigate(['/confirm-booking'], {
      queryParams: {
        providerId: this.providerId,
        serviceId:  this.selectedServiceId()
      }
    });
  }

  goBack(): void {
    this.router.navigate(
      this.providerId ? ['/proveedor', this.providerId] : ['/explorar']
    );
  }
}