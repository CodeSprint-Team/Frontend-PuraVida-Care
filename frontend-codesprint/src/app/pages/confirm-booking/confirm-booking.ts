import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, signal, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroCalendar, heroMapPin,
  heroExclamationCircle, heroPhone, heroHeart
} from '@ng-icons/heroicons/outline';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as L from 'leaflet';

import { NavbarComponent } from '../../components/navbar/navbar';
import { ProfileService } from '../../services/profile/profile';
import { ServiceBookingService } from '../../services/booking.service';
import { NotificationService } from '../../components/notification/notification.service';
import { CreateServiceBookingRequest } from '../../interfaces/booking-model';

// Tipos de precio que puede venir del backend
type PriceMode = 'HOUR' | 'DAY' | 'SERVICE' | 'PER_HOUR' | 'PER_DAY' | 'PER_SERVICE' | string;

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIcon],
  viewProviders: [provideIcons({
    heroArrowLeft, heroCalendar, heroMapPin,
    heroExclamationCircle, heroPhone, heroHeart
  })],
  templateUrl: './confirm-booking.html',
  styleUrl: './confirm-booking.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmBooking implements OnInit, AfterViewInit, OnDestroy {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private profileService = inject(ProfileService);
  private bookingService = inject(ServiceBookingService);
  private notifications  = inject(NotificationService);

  // ── Signals ───────────────────────────────────────────────────
  provider        = signal<any>(null);
  selectedService = signal<any>(null);
  loading         = signal(false);
  submitted       = signal(false);
  errorMessage    = signal('');

  private resolvedClientProfileId = signal<number | null>(null);
  private resolvedSeniorProfileId = signal<number | null>(null);

  // ── Form fields ───────────────────────────────────────────────
  fecha           = '';
  hora            = '';
  origen          = '';
  destino         = '';
  marcarFavorito  = false;
  agreedPriceMode: 'PAYPAL' | 'CARD' = 'CARD';

  providerId = '';
  serviceId  = '';

  // ── Leaflet ───────────────────────────────────────────────────
  map!: L.Map;
  originMarker!: L.Marker;
  originLatitude  = signal<number | null>(null);
  originLongitude = signal<number | null>(null);

  destinationMap!: L.Map;
  destinationMarker!: L.Marker;
  destinationLatitude  = signal<number | null>(null);
  destinationLongitude = signal<number | null>(null);

  // ── Computed: detectar telemedicina ───────────────────────────
  isTelemedicine = computed(() => {
    const svc = this.selectedService();
    if (!svc) return false;
    const name = (svc.name ?? svc.title ?? '').toLowerCase();
    const cat  = (svc.category ?? svc.categoryName ?? '').toLowerCase();
    return name.includes('telemedicina') || cat.includes('telemedicina');
  });

  // ── Computed: etiqueta de precio ──────────────────────────────
  priceLabel = computed(() => {
    const svc = this.selectedService();
    if (!svc) return '';
    return this.getPriceLabelFromMode(
      svc.priceType ?? svc.billingType ?? svc.priceMode ?? ''
    );
  });

  // ── Computed: validación de fecha ─────────────────────────────
  fechaEsPasada = computed(() => {
    if (!this.fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(this.fecha + 'T00:00:00') < hoy;
  });

  // ── Computed: formulario válido (depende de si es telemedicina)
  formValido = computed(() => {
    const baseValido =
      !!this.fecha &&
      !!this.hora &&
      !this.fechaEsPasada();

    if (this.isTelemedicine()) return baseValido;

    return baseValido &&
      !!this.origen &&
      !!this.destino &&
      this.originLatitude()  !== null &&
      this.originLongitude() !== null &&
      this.destinationLatitude()  !== null &&
      this.destinationLongitude() !== null;
  });

  // ── Computed: total estimado inteligente ──────────────────────
  totalEstimado = computed(() => {
    const svc = this.selectedService();
    if (!svc) return 'Consultando...';

    const precio = parseFloat(
      String(svc.price ?? svc.basePrice ?? 0).replace(/[^0-9.]/g, '')
    );
    if (isNaN(precio) || precio === 0) return 'Consultar';

    const mode: PriceMode =
      (svc.priceType ?? svc.billingType ?? svc.priceMode ?? '').toUpperCase();

    if (mode.includes('DAY')) {
      const min = (precio * 1).toLocaleString('es-CR');
      const max = (precio * 3).toLocaleString('es-CR');
      return `₡${min} - ₡${max} (estimado por días)`;
    }

    if (mode.includes('SERVICE')) {
      return `₡${precio.toLocaleString('es-CR')} (precio fijo)`;
    }

    // Por hora (default)
    const min = (precio * 2).toLocaleString('es-CR');
    const max = (precio * 4).toLocaleString('es-CR');
    return `₡${min} - ₡${max}`;
  });

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.providerId = params['providerId'];
      this.serviceId  = params['serviceId'];
      if (this.providerId) {
        this.loadProviderAndResolveProfile();
      }
    });
  }

  ngAfterViewInit(): void {
    // Los mapas solo se inicializan si NO es telemedicina
    // Pero en este momento aún no sabemos el servicio,
    // así que esperamos a que se cargue en loadProviderAndResolveProfile
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.destinationMap?.remove();
  }

  // ── Carga proveedor + perfil en paralelo ──────────────────────
  private loadProviderAndResolveProfile(): void {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.errorMessage.set('No se pudo identificar el usuario. Inicia sesión nuevamente.');
      return;
    }

    forkJoin({
      provider: this.profileService.getProviderProfile(this.providerId),
      clientProfile: this.profileService.getClientProfileByUserId(Number(userId)).pipe(
        catchError(() => of(null))
      ),
      seniorProfile: this.profileService.getSeniorProfileByUserId(Number(userId)).pipe(
        catchError(() => of(null))
      )
    }).subscribe({
      next: ({ provider, clientProfile, seniorProfile }) => {
        this.provider.set(provider);

        const svc = provider.services?.find(
          (s: any) => String(s.id) === String(this.serviceId)
        );
        this.selectedService.set(svc ?? null);

        if (clientProfile?.id) {
          this.resolvedClientProfileId.set(Number(clientProfile.id));
        }
        if (seniorProfile?.id) {
          this.resolvedSeniorProfileId.set(Number(seniorProfile.id));
        }

        if (!clientProfile && !seniorProfile) {
          this.errorMessage.set(
            'No se encontró un perfil de cliente o adulto mayor asociado a tu cuenta.'
          );
        }

        // Inicializar mapas solo si NO es telemedicina
        if (!this.isTelemedicine()) {
          setTimeout(() => {
            this.initOriginMap();
            this.initDestinationMap();
          }, 100);
        }
      },
      error: () => {
        this.errorMessage.set('Error al cargar los datos del proveedor.');
      }
    });
  }

  // ── Mapas ─────────────────────────────────────────────────────
  private initOriginMap(): void {
    if (this.map) return; // evita doble inicialización
    this.map = L.map('booking-map').setView([9.9281, -84.0907], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.originLatitude.set(e.latlng.lat);
      this.originLongitude.set(e.latlng.lng);
      if (this.originMarker) {
        this.originMarker.setLatLng(e.latlng);
      } else {
        this.originMarker = L.marker(e.latlng).addTo(this.map);
      }
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }

  private initDestinationMap(): void {
    if (this.destinationMap) return;
    this.destinationMap = L.map('destination-map').setView([9.9281, -84.0907], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.destinationMap);

    this.destinationMap.on('click', (e: L.LeafletMouseEvent) => {
      this.destinationLatitude.set(e.latlng.lat);
      this.destinationLongitude.set(e.latlng.lng);
      if (this.destinationMarker) {
        this.destinationMarker.setLatLng(e.latlng);
      } else {
        this.destinationMarker = L.marker(e.latlng).addTo(this.destinationMap);
      }
    });

    setTimeout(() => this.destinationMap.invalidateSize(), 0);
  }

  // ── Helpers de precio ─────────────────────────────────────────
  getPriceLabelFromMode(mode: PriceMode): string {
    const m = mode.toUpperCase();
    if (m.includes('DAY'))     return '/ día';
    if (m.includes('SERVICE')) return '/ servicio';
    return '/ hora';
  }

  setAgreedPriceMode(mode: 'PAYPAL' | 'CARD'): void {
    this.agreedPriceMode = mode;
  }

  // ── Confirmar reserva ─────────────────────────────────────────
  confirmar(): void {
    this.submitted.set(true);
    if (this.loading()) return;

    if (!this.formValido()) {
      if (!this.isTelemedicine()) {
        if (this.originLatitude() === null) {
          this.errorMessage.set('Debes seleccionar el punto de origen en el mapa.');
        } else if (this.destinationLatitude() === null) {
          this.errorMessage.set('Debes seleccionar el punto de destino en el mapa.');
        } else {
          this.errorMessage.set('Completa todos los campos obligatorios.');
        }
      } else {
        this.errorMessage.set('Completa la fecha y la hora.');
      }
      return;
    }

    const clientProfileId = this.resolvedClientProfileId();
    const seniorProfileId = this.resolvedSeniorProfileId();

    if (!clientProfileId && !seniorProfileId) {
      this.errorMessage.set(
        'No se encontró tu perfil. Completa tu perfil antes de reservar.'
      );
      this.notifications.error('Perfil requerido', 'Completa tu perfil para continuar');
      return;
    }

    const svc = this.selectedService();
    if (!svc) {
      this.errorMessage.set('No se encontró el servicio seleccionado.');
      return;
    }

    const agreedPrice = parseFloat(
      String(svc.price ?? svc.basePrice ?? 0).replace(/[^0-9.]/g, '')
    );
    if (!agreedPrice || isNaN(agreedPrice)) {
      this.errorMessage.set('No se pudo determinar el precio del servicio.');
      return;
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.errorMessage.set('No se pudo identificar el usuario logueado.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    // Si es telemedicina → ubicaciones null
    const payload: CreateServiceBookingRequest = {
      userId:          Number(userId),
      clientProfileId: clientProfileId,
      seniorProfileId: seniorProfileId,
      careServiceId:   Number(svc.id),
      scheduledAt:     `${this.fecha}T${this.hora}:00`,

      originText:      this.isTelemedicine() ? null : (this.origen || null),
      destinationText: this.isTelemedicine() ? null : (this.destino || null),
      originLatitude:  this.isTelemedicine() ? null : this.originLatitude(),
      originLongitude: this.isTelemedicine() ? null : this.originLongitude(),
      destinationLatitude:  this.isTelemedicine() ? null : this.destinationLatitude(),
      destinationLongitude: this.isTelemedicine() ? null : this.destinationLongitude(),

      agreedPrice,
      agreedPriceMode: this.agreedPriceMode
    };

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.notifications.success(
          'Reserva confirmada',
          'Tu solicitud fue enviada al proveedor'
        );
        this.router.navigate(['/agenda-cliente']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          'Error al confirmar la reserva. Intenta de nuevo.';
        this.errorMessage.set(msg);
        this.notifications.error('Error al reservar', msg);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/select-service'], {
      queryParams: { providerId: this.providerId }
    });
  }
}