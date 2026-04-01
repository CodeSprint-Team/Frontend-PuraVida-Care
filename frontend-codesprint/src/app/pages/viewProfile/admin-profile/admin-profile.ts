import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../services/profile.services'; 
import { AdminProfile } from '../models/admin-profile.model';
import {
  heroPencilSquare, heroUser, heroEnvelope,
  heroShieldCheck, heroUsers, heroPhoto,
  heroArrowRightOnRectangle, heroChartBar,
  heroArrowTrendingUp, heroStar, heroCog6Tooth
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroPencilSquare, heroUser, heroEnvelope,
    heroShieldCheck, heroUsers, heroPhoto,
    heroArrowRightOnRectangle, heroChartBar,
    heroArrowTrendingUp, heroStar, heroCog6Tooth
  })],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
})
export class AdminProfileComponent implements OnInit {
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private profileService = inject(ProfileService); 
  private authService    = inject(AuthService);
  private cdr            = inject(ChangeDetectorRef);

  profileData: AdminProfile | null = null;
  errorMessage = '';
  userId = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.userId) {
      this.loadProfile();
    } else {
      this.errorMessage = 'No se encontró un ID de usuario válido.';
    }
  }

  loadProfile(): void {
    this.errorMessage = '';
    // 👇 Usamos el nuevo nombre de la variable de servicio inyectada
    this.profileService.getAdminProfile(this.userId).subscribe({
      next: (profile) => {
        this.profileData = profile;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.errorMessage = 'No se pudo cargar el perfil. Intenta nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }

  hasPhoto(): boolean {
    return !!this.profileData?.photoUrl; 
  }

  navigateToEdit(): void {
    this.router.navigate(['/admin-profile-edit', this.userId]);
  }

  logout(): void {
    this.authService.logout();
  }
}