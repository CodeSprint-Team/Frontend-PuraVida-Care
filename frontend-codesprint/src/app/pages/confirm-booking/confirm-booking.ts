import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroCalendar,
  heroMapPin,
  heroExclamationCircle,
  heroPhone,
  heroHeart
} from '@ng-icons/heroicons/outline';
import * as L from 'leaflet';

import { NavbarComponent } from '../../components/navbar/navbar';
import { ProfileService } from '../../services/profile/profile';
import { ServiceBookingService } from '../../services/booking.service';
import { CreateServiceBookingRequest } from '../../interfaces/booking-model';

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIcon],
  viewProviders: [
    provideIcons({
      heroArrowLeft,
      heroCalendar,
      heroMapPin,
      heroExclamationCircle,
      heroPhone,
      heroHeart
    })
  ],
  templateUrl: './confirm-booking.html',
  styleUrl: './confirm-booking.css'
})
export class ConfirmBooking implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private bookingService = inject(ServiceBookingService);
  private cdr = inject(ChangeDetectorRef);

  providerId!: string;
  serviceId!: string;
  provider: any;
  selectedService: any;

  fecha = '';
  hora = '';
  origen = '';
  destino = '';
  marcarFavorito = false;

  errorMessage = '';
  loading = false;
  submitted = false;

  agreedPriceMode: 'PAYPAL' | 'CARD' = 'CARD';
  seniorProfileId: number | null = null;

  map!: L.Map;
  originMarker!: L.Marker;
  originLatitude: number | null = null;
  originLongitude: number | null = null;
  destinationMap!: L.Map;
  destinationMarker!: L.Marker;
  destinationLatitude: number | null = null;
  destinationLongitude: number | null = null;

  get fechaEsPasada(): boolean {
    if (!this.fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaIngresada = new Date(this.fecha + 'T00:00:00');
    return fechaIngresada < hoy;
  }

  get formValido(): boolean {
    return (
      !!this.fecha &&
      !!this.hora &&
      !!this.origen &&
      !!this.destino &&
      this.originLatitude !== null &&
      this.originLongitude !== null &&
      this.destinationLatitude !== null &&
      this.destinationLongitude !== null &&
      !this.fechaEsPasada
    );
  }

  get totalEstimado(): string {
    if (!this.selectedService) return 'Consultando...';

    const precio = parseFloat(
      String(this.selectedService.price).replace(/[^0-9.]/g, '')
    );

    if (isNaN(precio)) return 'Consultar';

    const min = (precio * 2).toLocaleString('es-CR');
    const max = (precio * 4).toLocaleString('es-CR');

    return `₡${min} - ₡${max}`;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.providerId = params['providerId'];
      this.serviceId = params['serviceId'];

      if (this.providerId) {
        this.loadProvider();
      }

      const userId = this.obtenerUsuarioLogueadoId();
      if (userId) {
        this.profileService.getSeniorProfileByUserId(userId).subscribe({
          next: (profile) => {
            this.seniorProfileId = profile.id;
            this.cdr.detectChanges();
          },
          error: () => {
            this.seniorProfileId = null;
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.initOriginMap();
    this.initDestinationMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }

    if (this.destinationMap) {
      this.destinationMap.remove();
    }
  }

  loadProvider(): void {
    this.profileService.getProviderProfile(this.providerId).subscribe({
      next: (res) => {
        this.provider = res;
        this.selectedService = res.services?.find(
          (s: any) => String(s.id) === String(this.serviceId)
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error al cargar los datos del proveedor.';
        this.cdr.detectChanges();
      }
    });
  }

  private initOriginMap(): void {
    const defaultLat = 9.9281;
    const defaultLng = -84.0907;

    this.map = L.map('booking-map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      this.originLatitude = lat;
      this.originLongitude = lng;

      if (this.originMarker) {
        this.originMarker.setLatLng([lat, lng]);
      } else {
        this.originMarker = L.marker([lat, lng]).addTo(this.map);
      }

      this.cdr.detectChanges();
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  private initDestinationMap(): void {
    const defaultLat = 9.9281;
    const defaultLng = -84.0907;

    this.destinationMap = L.map('destination-map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.destinationMap);

    this.destinationMap.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      this.destinationLatitude = lat;
      this.destinationLongitude = lng;

      if (this.destinationMarker) {
        this.destinationMarker.setLatLng([lat, lng]);
      } else {
        this.destinationMarker = L.marker([lat, lng]).addTo(this.destinationMap);
      }

      this.cdr.detectChanges();
    });

    setTimeout(() => {
      this.destinationMap.invalidateSize();
    }, 0);
  }

  setAgreedPriceMode(mode: 'PAYPAL' | 'CARD'): void {
    this.agreedPriceMode = mode;
  }

  private obtenerUsuarioLogueadoId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? Number(userId) : null;
  }

  confirmar(): void {
    this.submitted = true;

    if (this.loading) return;

    if (!this.formValido) {
      if (this.originLatitude === null || this.originLongitude === null) {
        this.errorMessage = 'Debes seleccionar el punto de origen en el mapa.';
      } else if (this.destinationLatitude === null || this.destinationLongitude === null) {
        this.errorMessage = 'Debes seleccionar el punto de destino en el mapa.';
      } else {
        this.errorMessage = 'Completa todos los campos obligatorios.';
      }
      this.cdr.detectChanges();
      return;
    }

    const loggedUserId = this.obtenerUsuarioLogueadoId();

    if (!loggedUserId) {
      this.errorMessage = 'No se pudo identificar el usuario logueado.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.selectedService) {
      this.errorMessage = 'No se encontró el servicio seleccionado.';
      this.cdr.detectChanges();
      return;
    }

    const agreedPrice = Number(
      String(this.selectedService?.price ?? 0).replace(/[^0-9.]/g, '')
    );

    if (!agreedPrice || isNaN(agreedPrice)) {
      this.errorMessage = 'No se pudo determinar el precio del servicio.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const scheduledAt = `${this.fecha}T${this.hora}:00`;

    const payload: CreateServiceBookingRequest = {
      userId: loggedUserId,
      clientProfileId: null,
      seniorProfileId: this.seniorProfileId,
      careServiceId: Number(this.selectedService.id),
      scheduledAt,
      originText: this.origen || null,
      destinationText: this.destino || null,
      originLatitude: this.originLatitude,
      originLongitude: this.originLongitude,
      destinationLatitude: this.destinationLatitude,
      destinationLongitude: this.destinationLongitude,
      agreedPrice,
      agreedPriceMode: this.agreedPriceMode
    };

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/agenda-cliente']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.error ||
          'Error al confirmar la reserva. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/select-service'], {
      queryParams: { providerId: this.providerId }
    });
  }
}