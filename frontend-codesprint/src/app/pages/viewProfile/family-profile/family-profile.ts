// src/app/viewProfile/family-profile/family-profile.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../services/profile.services';
import { FamilyProfile } from '../models/family-profile.model';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare, heroUser, heroPhone, heroEnvelope, heroUsers,
  heroExclamationTriangle, heroShieldCheck, heroDocumentText, heroPhoto
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-family-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroPencilSquare, heroUser, heroPhone, heroEnvelope, heroUsers,
    heroExclamationTriangle, heroShieldCheck, heroDocumentText, heroPhoto
  })],
  templateUrl: './family-profile.html',
  styleUrl: './family-profile.css',
})
export class FamilyProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private cdr            = inject(ChangeDetectorRef);

  profile: FamilyProfile | null = null;
  errorMessage = '';
  userId       = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '1';
    this.loadProfile();
  }

  loadProfile(): void {
    this.errorMessage = '';
    this.profileService.getFamilyProfile(this.userId).subscribe({
      next: (data) => {
        // El backend devuelve emergencyContactName/Relation/Phone
        // los mapeamos a emergencyName/Relation/Phone que usa el HTML
        this.profile = {
          ...data,
          emergencyName:     data.emergencyContactName     ?? data.emergencyName     ?? '',
          emergencyRelation: data.emergencyContactRelation ?? data.emergencyRelation ?? '',
          emergencyPhone:    data.emergencyContactPhone    ?? data.emergencyPhone    ?? '',
          importantNotes:    data.importantNotes           ?? data.notes             ?? '',
          relationToSenior:  data.relationToSenior         ?? '',
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando perfil familiar:', err);
        this.errorMessage = 'No se pudo cargar el perfil. Intenta nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/family-profile-edit', this.userId]);
  }

  hasProfileImage(): boolean {
    return !!this.profile?.profileImage;
  }
}