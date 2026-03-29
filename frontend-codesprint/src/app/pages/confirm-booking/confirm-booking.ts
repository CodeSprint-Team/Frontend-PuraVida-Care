import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroCalendar, heroMapPin,
  heroExclamationCircle, heroPhone, heroHeart
} from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../components/navbar/navbar';
import { ProfileService } from '../../services/profile/profile';

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIcon],
  viewProviders: [provideIcons({ heroArrowLeft, heroCalendar, heroMapPin, heroExclamationCircle, heroPhone, heroHeart })],
  templateUrl: './confirm-booking.html',
  styleUrl: './confirm-booking.css'
})
export class ConfirmBooking implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private profileService = inject(ProfileService);
  private http           = inject(HttpClient);
  private cdr            = inject(ChangeDetectorRef);

  providerId!: string;
  serviceId!: string;
  provider: any;
  selectedService: any;

  fecha             = '';
  hora              = '';
  origen            = '';
  destino           = '';
  notas             = '';
  contactoEmergencia = '';
  marcarFavorito    = false;

  errorMessage = '';
  loading      = false;
  submitted    = false;

  get formValido(): boolean {
    return !!this.fecha && !!this.hora && !!this.origen && !!this.destino && !!this.contactoEmergencia;
  }

  get totalEstimado(): string {
    if (!this.selectedService) return 'Consultando...';
    const precio = parseFloat(String(this.selectedService.price).replace(/[^0-9.]/g, ''));
    if (isNaN(precio)) return 'Consultar';
    const min = (precio * 2).toLocaleString('es-CR');
    const max = (precio * 4).toLocaleString('es-CR');
    return `₡${min} - ₡${max}`;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.providerId = params['providerId'];
      this.serviceId  = params['serviceId'];
      if (this.providerId) this.loadProvider();
    });
  }

  loadProvider(): void {
    this.profileService.getProviderProfile(this.providerId).subscribe({
      next: (res) => {
        this.provider        = res;
        this.selectedService = res.services?.find((s: any) => String(s.id) === String(this.serviceId));
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error al cargar los datos del proveedor.';
        this.cdr.detectChanges();
      }
    });
  }

  confirmar(): void {
    this.submitted = true;
    if (!this.formValido) return;
    this.loading = true;

    const payload = {
      providerId: this.providerId,
      serviceId:  this.serviceId,
      fecha:      this.fecha,
      hora:       this.hora,
      origen:     this.origen,
      destino:    this.destino,
      notas:      this.notas,
      contactoEmergencia: this.contactoEmergencia,
      marcarFavorito:     this.marcarFavorito
    };

//ajustar endpoint para realizar la reserva, actualmente es un placeholder
    this.http.post('/api/bookings', payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/explorar']);
      },
      error: () => {
        this.loading      = false;
        this.errorMessage = 'Error al confirmar la reserva. Intenta de nuevo.';
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
