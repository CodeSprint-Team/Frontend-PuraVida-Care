import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { ProfileService } from '../../viewProfile/services/profile.services';
import { FavoritesService } from '../../../services/favorite.services';
import { ProviderProfile } from '../../viewProfile/models/provider-profile.model';
import {
  heroArrowLeft, heroCheckBadge, heroMapPin, heroShieldCheck,
  heroPhone, heroEnvelope, heroStar, heroBriefcase,
  heroUserCircle, heroHeart
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-public-provider-profile',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NavbarComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroCheckBadge, heroMapPin, heroShieldCheck,
    heroPhone, heroEnvelope, heroStar, heroBriefcase,
    heroUserCircle, heroHeart
  })],
  templateUrl: './public-provider-profile.html',
  styleUrl: './public-provider-profile.css',
})
export class PublicProviderProfileComponent implements OnInit {
  private route             = inject(ActivatedRoute);
  private router            = inject(Router);
  private profileService    = inject(ProfileService);
  readonly favoritesService = inject(FavoritesService);
  private cdr               = inject(ChangeDetectorRef);

  provider: ProviderProfile | null = null;
  errorMessage = '';
  providerId   = '';

  ngOnInit(): void {
    this.providerId = this.route.snapshot.paramMap.get('id') ?? '1';
    this.favoritesService.loadFavorites();
    this.loadProfile();
  }

  loadProfile(): void {
    this.errorMessage = '';
    this.profileService.getProviderProfile(this.providerId).subscribe({
      next: (data) => { this.provider = data; this.cdr.detectChanges(); },
      error: () => {
        this.errorMessage = 'No se pudo cargar el perfil del proveedor.';
        this.cdr.detectChanges();
      }
    });
  }

  get canUseFavorites(): boolean {
    return this.favoritesService.canUseFavorites;
  }


  // Vuelve a explorar, no al perfil del proveedor
  goBack(): void {
    this.router.navigate(['/explorar']);
  }

  hireProvider() {
    const providerId = this.provider?.id;
    if (providerId) {
      this.router.navigate(['/select-service'], { queryParams: { providerId: providerId.toString() } });
    }
  }
  hasProfileImage(): boolean {
    return !!this.provider?.profileImage;
  }

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite(Number(this.providerId));
  }

  toggleFavorite(): void {
    if (!this.canUseFavorites) return;
    this.favoritesService.toggleFavorite(Number(this.providerId)).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => console.error('Error al actualizar favorito:', err)
    });
  }

  get ratingBars(): { stars: number; percentage: number }[] {
    const dist = (this.provider as any)?.ratingDistribution ?? {};
    return [5, 4, 3, 2, 1].map(stars => ({ stars, percentage: dist[stars] ?? 0 }));

  }


  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
  }

  get ratingDisplay(): string {
    return this.provider?.averageRating?.toFixed(1) ?? '0.0';
  }

  get startingPrice(): string {
    return this.provider?.services?.length ? this.provider.services[0].price : 'Consultar';
  }
}
