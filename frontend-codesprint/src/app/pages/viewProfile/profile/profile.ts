// src/app/viewProfile/profile/profile.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ProfileService } from '../services/profile.services';
import { AuthService } from '../../../services/auth.service';
import { SeniorProfile, FavoriteProviderDTO } from '../models/senior-profile.model';
import {
  heroPencilSquare, heroUser, heroPhone, heroEnvelope,
  heroMapPin, heroShieldCheck, heroInformationCircle,
  heroDocumentText, heroHeart, heroStar, heroUsers, heroPhoto, heroTrash,
  heroArrowRightOnRectangle
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroPencilSquare, heroUser, heroPhone, heroEnvelope,
    heroMapPin, heroShieldCheck, heroInformationCircle,
    heroDocumentText, heroHeart, heroStar, heroUsers, heroPhoto, heroTrash,
    heroArrowRightOnRectangle
  })],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private authService    = inject(AuthService);
  private cdr            = inject(ChangeDetectorRef);

  profileData: SeniorProfile | null = null;
  errorMessage = '';
  userId       = '';
  profileId    = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadProfile();
  }

  loadProfile(): void {
    this.errorMessage = '';
    // Carga por userId usando el endpoint by-user
    this.profileService.getSeniorProfileByUserId(this.userId).subscribe({
    next: (profile) => {
        this.profileData = profile;
        this.profileId = String(profile.id);
        localStorage.setItem('profile_id', this.profileId); // ← Después de asignarlo
        this.cdr.detectChanges();
    },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.errorMessage = 'No se pudo cargar el perfil. Intenta nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }

  removeFavorite(provider: FavoriteProviderDTO): void {
    if (!this.profileData) return;
    this.profileService.removeFavoriteProvider(this.profileData.id, provider.providerProfileId)
      .subscribe({
        next: (updated) => {
          this.profileData = updated;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error eliminando favorito:', err)
      });
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  navigateToEdit(): void {
    this.router.navigate(['/profile-edit', this.profileId]);
  }

  logout(): void {
    this.authService.logout();
  }

  hasProfileImage(): boolean {
    return !!this.profileData?.profileImage;
  }

  goToMyServices(): void {
  this.router.navigate(['/my-completed-services']);
}
  verOfertasRecibidas(): void {
  this.router.navigate(['/support-products/received-offers']);
}

verOfertasRealizadas(): void {
  this.router.navigate(['/support-products/made-offers']);
}
}