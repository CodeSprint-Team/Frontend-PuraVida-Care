// src/app/viewProfile/provider-profile/provider-profile.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { ProfileService } from '../services/profile.services';
import { ProviderProfile } from '../models/provider-profile.model';
import {
  heroArrowLeft, heroCheckBadge, heroMapPin, heroShieldCheck,
  heroPhone, heroEnvelope, heroClock, heroPencilSquare,
  heroStar, heroBriefcase, heroUserCircle, heroClipboardDocumentList
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NavbarComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroCheckBadge, heroMapPin, heroShieldCheck,
    heroPhone, heroEnvelope, heroClock, heroPencilSquare,
    heroStar, heroBriefcase, heroUserCircle, heroClipboardDocumentList
  })],
  templateUrl: './provider-profile.html',
  styleUrls: ['./provider-profile.css'],
})
export class ProviderProfileComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private profileService = inject(ProfileService);
  private cdr            = inject(ChangeDetectorRef);

  provider: ProviderProfile | null = null;
  isLoading    = false;
  errorMessage = '';
  userId       = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '1';
    this.loadProfile();
  }

  loadProfile(): void {
    this.errorMessage = '';
    this.profileService.getProviderProfile(this.userId).subscribe({
      next: (data: ProviderProfile) => {
        this.provider = data;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error cargando proveedor:', err);
        this.errorMessage = 'No se pudo cargar el perfil del proveedor.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/providers']);
  }

  editProviderProfile(): void {
    this.router.navigate(['/provider-profile-edit', this.userId]);
  }

  hireProvider(): void {
    this.router.navigate(['/seleccionar-servicio', this.userId]);
  }

  goToSolicitudes(): void {
    this.router.navigate(['/proveedor/solicitudes', this.userId]);
  }

  hasProfileImage(): boolean {
    return !!this.provider?.profileImage;
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  get ratingDisplay(): string {
    return this.provider?.averageRating?.toFixed(1) ?? '0.0';
  }

  get startingPrice(): string {
    return this.provider?.services?.length
      ? this.provider.services[0].price
      : 'Consultar';
  }
}