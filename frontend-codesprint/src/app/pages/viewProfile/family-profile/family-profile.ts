import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../services/profile.services';
import { AuthService } from '../../../services/auth.service';
import { FamilyProfile } from '../models/family-profile.model';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  heroPencilSquare, heroUser, heroPhone, heroEnvelope, heroUsers,
  heroExclamationTriangle, heroShieldCheck, heroDocumentText, heroPhoto,
  heroArrowRightOnRectangle, heroStar, heroHeart, heroTrash, heroMapPin,
} from '@ng-icons/heroicons/outline';
import { TelemedHistoryComponent } from '../../../components/telemedicina/telemed-history.component';

interface FavoriteProviderItem {
  id: number;
  fullName: string;
  providerType: string | null;
  averageRating: number;
  providerState: string;
  providerProfileId: number;
}

@Component({
  selector: 'app-family-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgIconComponent, TelemedHistoryComponent],
  viewProviders: [provideIcons({
    heroPencilSquare, heroUser, heroPhone, heroEnvelope, heroUsers,
    heroExclamationTriangle, heroShieldCheck, heroDocumentText, heroPhoto,
    heroArrowRightOnRectangle, heroStar, heroHeart, heroTrash, heroMapPin,
  })],
  templateUrl: './family-profile.html',
  styleUrl: './family-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FamilyProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService    = inject(AuthService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private http           = inject(HttpClient);
  private cdr            = inject(ChangeDetectorRef);

  profile: FamilyProfile | null = null;
  errorMessage = '';
  userId       = '';
  profileId    = '';
  seniorProfileId = '';

  favorites: FavoriteProviderItem[] = [];
  loadingFavorites = false;

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')
      ?? this.authService.getUserId()
      ?? '';
    this.loadProfile();
  }

  loadProfile(): void {
    this.errorMessage = '';

    this.profileService.getFamilyProfileByUserId(this.userId).subscribe({
      next: (data) => {
        this.profile = {
          ...data,
          emergencyName:     data.emergencyContactName     ?? data.emergencyName     ?? '',
          emergencyRelation: data.emergencyContactRelation ?? data.emergencyRelation ?? '',
          emergencyPhone:    data.emergencyContactPhone    ?? data.emergencyPhone    ?? '',
          importantNotes:    data.importantNotes           ?? data.notes             ?? '',
          relationToSenior:  data.relationToSenior         ?? '',
        };
        this.profileId = String(data.id);
        this.seniorProfileId = String(
          (data as any).seniorProfileId
          ?? (data as any).seniorId
          ?? (data as any).senior_profile_id
          ?? ''
        );
        localStorage.setItem('profile_id', this.profileId);
        this.cdr.markForCheck();
        this.loadFavorites();
      },
      error: (err) => {
        console.error('Error cargando perfil familiar:', err);
        this.errorMessage = 'No se pudo cargar el perfil. Intenta nuevamente.';
        this.cdr.markForCheck();
      }
    });
  }

  private loadFavorites(): void {
    this.loadingFavorites = true;
    this.cdr.markForCheck();

    this.http.get<number[]>(
      `${environment.apiUrl}/profiles/client/${this.profileId}/favorites`
    ).subscribe({
      next: (ids) => {
        if (!ids || ids.length === 0) {
          this.favorites = [];
          this.loadingFavorites = false;
          this.cdr.markForCheck();
          return;
        }

        const requests = ids.map(providerId =>
          this.http.get<any>(
            `${environment.apiUrl}/profiles/provider/${providerId}`
          ).pipe(catchError(() => of(null)))
        );

        forkJoin(requests).subscribe({
          next: (providers) => {
            this.favorites = providers
              .filter(p => p !== null)
              .map(provider => ({
                id:                provider.id,
                providerProfileId: provider.id,
                fullName:          provider.fullName,
                providerType:      provider.providerType ?? null,
                averageRating:     provider.averageRating ?? 0,
                providerState:     provider.providerState ?? '',
              }));
            this.loadingFavorites = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.loadingFavorites = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        console.warn('No se pudieron cargar los favoritos');
        this.loadingFavorites = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeFavorite(providerProfileId: number): void {
    this.http.delete(
      `${environment.apiUrl}/profiles/client/${this.profileId}/favorites/${providerProfileId}`
    ).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.providerProfileId !== providerProfileId);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error eliminando favorito:', err)
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  hasProfileImage(): boolean {
    return !!this.profile?.profileImage;
  }

  // ── Navegación ────────────────────────────────────────────────────────────

  goToProvider(id: number): void {
    this.router.navigate(['/proveedor', id]);
  }

  logout(): void {
    this.authService.logout();
  }

  editProfile(): void {
    this.router.navigate(['/family-profile-edit', this.profileId]);
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

  goToMapaHogar(): void {
    localStorage.setItem('current_booking_id', this.profileId);
    this.router.navigate(['/home-filter']);
  }

  goToMapaHogarConReserva(bookingId: number): void {
    localStorage.setItem('current_booking_id', String(bookingId));
    this.router.navigate(['/home-filter']);
  }
}