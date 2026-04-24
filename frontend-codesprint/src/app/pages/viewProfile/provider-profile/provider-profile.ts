import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
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
  heroArrowRightOnRectangle, heroChevronDown, heroChevronUp
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NavbarComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroCheckBadge, heroMapPin, heroShieldCheck,
    heroPhone, heroEnvelope, heroClock, heroPencilSquare,
    heroStar, heroBriefcase, heroUserCircle, heroClipboardDocumentList,
    heroArrowRightOnRectangle, heroChevronDown, heroChevronUp
  })],
  templateUrl: './provider-profile.html',
  styleUrls: ['./provider-profile.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // ─── Show more / less ───
  readonly INITIAL_VISIBLE = 3;

  showAllServices = false;
  showAllReviews  = false;

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadProfile();
  }

  loadProfile(): void {
    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.markForCheck();

    this.profileService.getProviderProfileByUserId(this.userId).subscribe({
      next: (data: ProviderProfile) => {
        this.provider  = data;
        this.profileId = String(data.id);
        this.isLoading = false;
        localStorage.setItem('profile_id', this.profileId);
        localStorage.setItem('user_id', this.userId);
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Error cargando proveedor:', err);
        this.errorMessage = 'No se pudo cargar el perfil del proveedor.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Visible slices ───
  get visibleServices(): any[] {
    const all = this.provider?.services ?? [];
    return this.showAllServices ? all : all.slice(0, this.INITIAL_VISIBLE);
  }

  get hasMoreServices(): boolean {
    return (this.provider?.services?.length ?? 0) > this.INITIAL_VISIBLE;
  }

  get remainingServicesCount(): number {
    return Math.max(0, (this.provider?.services?.length ?? 0) - this.INITIAL_VISIBLE);
  }

  toggleShowAllServices(): void {
    this.showAllServices = !this.showAllServices;
    this.cdr.markForCheck();
  }

  get visibleReviews(): any[] {
    const all = this.provider?.reviewsList ?? [];
    return this.showAllReviews ? all : all.slice(0, this.INITIAL_VISIBLE);
  }

  get hasMoreReviews(): boolean {
    return (this.provider?.reviewsList?.length ?? 0) > this.INITIAL_VISIBLE;
  }

  get remainingReviewsCount(): number {
    return Math.max(0, (this.provider?.reviewsList?.length ?? 0) - this.INITIAL_VISIBLE);
  }

  toggleShowAllReviews(): void {
    this.showAllReviews = !this.showAllReviews;
    this.cdr.markForCheck();
  }

  // ─── Existing methods ───
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

  verOfertasRecibidas(): void {
    this.router.navigate(['/support-products/received-offers']);
  }

  verOfertasRealizadas(): void {
    this.router.navigate(['/support-products/made-offers']);
  }
}