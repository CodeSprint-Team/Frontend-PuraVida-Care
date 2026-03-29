import {Component, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProviderProfile } from '../viewProfile/models/provider-profile.model';
import { ProfileService } from '../../services/profile/profile';
import { NavbarComponent } from '../../components/navbar/navbar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroCheck, heroClock } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-select-service',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgIcon],
  viewProviders: [provideIcons({ heroArrowLeft, heroCheck, heroClock })],
  templateUrl: './select-service.html',
  styleUrls: ['./select-service.css']
})
export class SelectService implements OnInit {

  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);

  providerId!: string;
  provider?: ProviderProfile;
  errorMessage?: string;
  selectedServiceId?: number | string;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.providerId = params['providerId'];
      if (this.providerId) {
        this.loadProvider();
      } else {
        this.errorMessage = 'No se recibió el proveedor.';
      }
    });
  }

  loadProvider() {
    this.profileService.getProviderProfile(this.providerId).subscribe({
      next: (res) => {
        this.provider = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los servicios del proveedor.';
        this.cdr.detectChanges();
      }
    });
  }

  selectService(service: any) {
    this.selectedServiceId = service.id;
  }

  formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
    return isNaN(num) ? String(price) : num.toLocaleString('es-CR');
  }

  continuar() {
    if (!this.selectedServiceId) return;
    this.router.navigate(['/confirm-booking'], {
      queryParams: {
        providerId: this.providerId,
        serviceId: this.selectedServiceId
      }
    });
  }

  goBack(): void {
    this.router.navigate(this.providerId ? ['/proveedor', this.providerId] : ['/explorar']);
  }
}
