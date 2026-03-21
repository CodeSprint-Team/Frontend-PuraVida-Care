import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProviderPending {
  providerProfileId: number;
  fullName: string;
  email: string;
  phone: string;
  providerType: string;
  experienceDescription: string;
  experienceYears: number;
  zone: string;
  providerState: string;
  profileImage: string;
}

export interface ReviewProviderDTO {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

// ── Usuarios

export interface UserStatus {
  userId: number;
  fullName: string;
  email: string;
  userState: string;
  provider: string;
  photoUrl: string | null;
  role: string;
}

export interface ReviewUserDTO {
  action: 'activate' | 'deactivate';
  reason?: string;
}

// ── Moderación de servicios

export interface CareServicePending {
  careServiceId: number;
  providerProfileId: number;
  providerName: string;
  providerEmail: string;
  title: string;
  serviceDescription: string;
  basePrice: number;
  priceMode: string;
  serviceCategory: string;
  publicationState: 'pending' | 'published' | 'rejected';
  rejectionReason?: string;
}

export interface ReviewCareServiceDTO {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

// ── Service

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8081/api/v1/admin';

  constructor(private http: HttpClient) {}

  // ── Proveedores

  getPendingProviders(): Observable<ProviderPending[]> {
    return this.http.get<ProviderPending[]>(`${this.apiUrl}/providers/pending`);
  }

  reviewProvider(id: number, dto: ReviewProviderDTO): Observable<ProviderPending> {
    return this.http.put<ProviderPending>(`${this.apiUrl}/providers/${id}/review`, dto);
  }

  // ── Usuarios

  getAllUsers(): Observable<UserStatus[]> {
    return this.http.get<UserStatus[]>(`${this.apiUrl}/users`);
  }

  reviewUser(id: number, dto: ReviewUserDTO): Observable<UserStatus> {
    return this.http.put<UserStatus>(`${this.apiUrl}/users/${id}/review`, dto);
  }

  // ── Moderación de servicios 

  getPendingCareServices(): Observable<CareServicePending[]> {
    return this.http.get<CareServicePending[]>(`${this.apiUrl}/services/pending`);
  }

  reviewCareService(id: number, dto: ReviewCareServiceDTO): Observable<CareServicePending> {
    return this.http.put<CareServicePending>(`${this.apiUrl}/services/${id}/review`, dto);
  }
}
