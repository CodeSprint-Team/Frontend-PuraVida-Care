// src/app/viewProfile/services/profile.services.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeniorProfile, SeniorProfileUpdateDTO } from '../models/senior-profile.model';
import { ProviderProfile, ProviderProfileUpdateDTO } from '../models/provider-profile.model';
import { FamilyProfile } from '../models/family-profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http    = inject(HttpClient);
  private baseUrl = 'http://localhost:8081/api/v1/profiles';

  // ── Senior ────────────────────────────────────────────────────
  getSeniorProfile(id: string | number): Observable<SeniorProfile> {
    return this.http.get<SeniorProfile>(`${this.baseUrl}/senior/${id}`);
  }

  updateSeniorProfile(id: string | number, data: SeniorProfileUpdateDTO): Observable<SeniorProfile> {
    return this.http.put<SeniorProfile>(`${this.baseUrl}/senior/${id}`, data);
  }

  addFavoriteProvider(seniorId: number, providerProfileId: number): Observable<SeniorProfile> {
    return this.http.post<SeniorProfile>(
      `${this.baseUrl}/senior/${seniorId}/favorites/${providerProfileId}`, {}
    );
  }

  removeFavoriteProvider(seniorId: number, providerProfileId: number): Observable<SeniorProfile> {
    return this.http.delete<SeniorProfile>(
      `${this.baseUrl}/senior/${seniorId}/favorites/${providerProfileId}`
    );
  }

  // ── Provider ──────────────────────────────────────────────────
  getProviderProfile(id: string | number): Observable<ProviderProfile> {
    return this.http.get<ProviderProfile>(`${this.baseUrl}/provider/${id}`);
  }

  updateProviderProfile(id: string | number, data: ProviderProfileUpdateDTO): Observable<ProviderProfile> {
    return this.http.put<ProviderProfile>(`${this.baseUrl}/provider/${id}`, data);
  }

  // ── Client / Family ───────────────────────────────────────────
  getFamilyProfile(id: string | number): Observable<FamilyProfile> {
    return this.http.get<FamilyProfile>(`${this.baseUrl}/client/${id}`);
  }

  updateFamilyProfile(id: string | number, data: Partial<FamilyProfile>): Observable<FamilyProfile> {
    // Separar fullName → username + lastname que espera el backend
    const parts    = (data.fullName ?? '').trim().split(' ');
    const username = parts[0] ?? '';
    const lastname = parts.slice(1).join(' ');

    // Mapeo exacto a ClientProfileUpdateDTO del backend
    const payload = {
      username,
      lastname,
      email:                    data.email                             ?? '',
      phone:                    data.phone                             ?? '',
      notes:                    '',
      profileImage:             data.profileImage                      ?? null,
      relationToSenior:         data.relationToSenior                  ?? '',
      emergencyContactName:     data.emergencyName                     ?? '',
      emergencyContactRelation: data.emergencyRelation                 ?? '',
      emergencyContactPhone:    data.emergencyPhone                    ?? '',
      importantNotes:           data.importantNotes                    ?? '',
    };

    return this.http.put<FamilyProfile>(`${this.baseUrl}/client/${id}`, payload);
  }
}