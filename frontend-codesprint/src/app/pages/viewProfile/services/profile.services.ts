import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { SeniorProfile, SeniorProfileUpdateDTO } from '../models/senior-profile.model';
import { ProviderProfile, ProviderProfileUpdateDTO } from '../models/provider-profile.model';
import { FamilyProfile } from '../models/family-profile.model';
import { AdminProfile, AdminProfileUpdateDTO } from '../models/admin-profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:8081/api/v1/profiles';

  // ═══════════════════════════════════════════════════════════════
  // SENIOR
  // ═══════════════════════════════════════════════════════════════

  getSeniorProfile(id: string | number): Observable<SeniorProfile> {
    return this.http.get<SeniorProfile>(`${this.baseUrl}/senior/${id}`);
  }

  getSeniorProfileByUserId(userId: string | number): Observable<SeniorProfile> {
    return this.http.get<SeniorProfile>(`${this.baseUrl}/senior/by-user/${userId}`);
  }

  updateSeniorProfile(id: string | number, data: SeniorProfileUpdateDTO): Observable<SeniorProfile> {
    return this.http.put<SeniorProfile>(`${this.baseUrl}/senior/${id}`, data);
  }

  addFavoriteProvider(seniorId: number, providerProfileId: number): Observable<SeniorProfile> {
    return this.http.post<SeniorProfile>(
      `${this.baseUrl}/senior/${seniorId}/favorites/${providerProfileId}`,
      {}
    );
  }

  removeFavoriteProvider(seniorId: number, providerProfileId: number): Observable<SeniorProfile> {
    return this.http.delete<SeniorProfile>(
      `${this.baseUrl}/senior/${seniorId}/favorites/${providerProfileId}`
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PROVIDER
  // ═══════════════════════════════════════════════════════════════

  getProviderProfile(id: string | number): Observable<ProviderProfile> {
    return this.http.get<ProviderProfile>(`${this.baseUrl}/provider/${id}`);
  }

  getProviderProfileByUserId(userId: string | number): Observable<ProviderProfile> {
    return this.http.get<ProviderProfile>(`${this.baseUrl}/provider/by-user/${userId}`);
  }

  updateProviderProfile(id: string | number, data: ProviderProfileUpdateDTO): Observable<ProviderProfile> {
    return this.http.put<ProviderProfile>(`${this.baseUrl}/provider/${id}`, data);
  }

  // ═══════════════════════════════════════════════════════════════
  // CLIENT / FAMILY
  // ═══════════════════════════════════════════════════════════════

  getFamilyProfile(id: string | number): Observable<FamilyProfile> {
    return this.http.get<any>(`${this.baseUrl}/client/${id}`)
      .pipe(map(raw => this.mapClientResponse(raw)));
  }

  getFamilyProfileByUserId(userId: string | number): Observable<FamilyProfile> {
    return this.http.get<any>(`${this.baseUrl}/client/by-user/${userId}`)
      .pipe(map(raw => this.mapClientResponse(raw)));
  }

  getFamilyProfileByEmail(email: string): Observable<FamilyProfile> {
    return this.http.get<any>(`${this.baseUrl}/client/by-email/${email}`)
      .pipe(map(raw => this.mapClientResponse(raw)));
  }

  updateFamilyProfile(id: string | number, data: Partial<FamilyProfile>): Observable<FamilyProfile> {
    const fullName = (data.fullName ?? '').trim();
    const spaceIdx = fullName.indexOf(' ');

    const username = spaceIdx > -1 ? fullName.substring(0, spaceIdx) : fullName;
    const lastname = spaceIdx > -1 ? fullName.substring(spaceIdx + 1) : '';

    const payload = {
      username,
      lastname,
      email: data.email ?? '',
      phone: data.phone ?? '',
      notes: '',
      profileImage: data.profileImage ?? null,
      relationToSenior: data.relationToSenior ?? '',
      emergencyContactName: data.emergencyName ?? '',
      emergencyContactRelation: data.emergencyRelation ?? '',
      emergencyContactPhone: data.emergencyPhone ?? '',
      importantNotes: data.importantNotes ?? '',
    };

    return this.http.put<any>(`${this.baseUrl}/client/${id}`, payload)
      .pipe(map(raw => this.mapClientResponse(raw)));
  }

  // ═══════════════════════════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════════════════════════

  getAdminProfile(userId: string | number): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.baseUrl}/admin/by-user/${userId}`);
  }

  updateAdminProfile(userId: string | number, dto: AdminProfileUpdateDTO): Observable<AdminProfile> {
    return this.http.put<AdminProfile>(`${this.baseUrl}/admin/by-user/${userId}`, dto);
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS / MAPPERS
  // ═══════════════════════════════════════════════════════════════

  private mapClientResponse(raw: any): FamilyProfile {
    return {
      id: String(raw.id),
      fullName: raw.fullName ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      profileImage: raw.profileImage ?? null,
      memberSince: raw.memberSince ?? '',
      address: raw.address ?? '',
      relationToSenior: raw.relationToSenior ?? '',
      importantNotes: raw.importantNotes ?? raw.notes ?? '',
      seniorProfileId: raw.seniorProfileId ?? null,  // ⬅ AGREGAR

      emergencyName: raw.emergencyContactName ?? '',
      emergencyRelation: raw.emergencyContactRelation ?? '',
      emergencyPhone: raw.emergencyContactPhone ?? '',

      emergencyContactName: raw.emergencyContactName ?? '',
      emergencyContactRelation: raw.emergencyContactRelation ?? '',
      emergencyContactPhone: raw.emergencyContactPhone ?? '',
    };
  }
}
