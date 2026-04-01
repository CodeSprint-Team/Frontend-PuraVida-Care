// src/app/pages/viewProfile/provider-profile/provider-profile.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { ProfileService } from '../services/profile.services';
import { AuthService } from '../../../services/auth.service';
import { ProviderProfile } from '../models/provider-profile.model';
import {
  heroArrowLeft, heroCheckBadge, heroMapPin, heroShieldCheck,
  heroPhone, heroEnvelope, heroClock, heroPencilSquare,
  heroStar, heroBriefcase, heroUserCircle, heroClipboardDocumentList,
  heroArrowRightOnRectangle
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NavbarComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroCheckBadge, heroMapPin, heroShieldCheck,
    heroPhone, heroEnvelope, heroClock, heroPencilSquare,
    heroStar, heroBriefcase, heroUserCircle, heroClipboardDocumentList,
    heroArrowRightOnRectangle
  })],
  templateUrl: './provider-profile.html',
  styleUrls: ['./provider-profile.css'],
})
export class ProviderProfileComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private profileService = inject(ProfileService);
  private authService    = inject(AuthService);
  private cdr            = inject(ChangeDetectorRef);

  provider: ProviderProfile | null = null;
  isLoading    = false;
  errorMessage = '';
  userId       = '';
  profileId    = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadProfile();
  }

  loadProfile(): void {
    this.errorMessage = '';
    this.profileService.getProviderProfileByUserId(this.userId).subscribe({
      next: (data: ProviderProfile) => {
        this.provider  = data;
        this.profileId = String(data.id);
        localStorage.setItem('profile_id', this.profileId);
        localStorage.setItem('user_id', this.userId);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error cargando proveedor:', err);
        this.errorMessage = 'No se pudo cargar el perfil del proveedor.';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  goBack(): void {
    this.router.navigate(['/provider-dashboard']);
  }

  editProviderProfile(): void {
    this.router.navigate(['/provider-profile-edit', this.profileId]);
  }

  goToSolicitudes(): void {
    this.router.navigate(['/provider-requests-service', this.profileId]);
  }

  hireProvider(): void {
    this.router.navigate(['/seleccionar-servicio', this.profileId]);
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