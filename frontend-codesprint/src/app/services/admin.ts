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
  createdAt?: string;
  documents?: { fileName: string; fileType: string; fileUrl: string }[];
  categories?: string[];
}

export interface ReviewProviderDTO {
  action: 'approve' | 'reject' | 'request_info';
  rejectionReason?: string;
  infoMessage?: string;
}

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

export type ServiceModerationAction = 'approve' | 'reject';
export type ServicePublicationState = 'pending' | 'published' | 'rejected';

export interface CareServicePending {
  careServiceId: number;
  title: string;
  serviceDescription: string;
  serviceCategory: string;
  basePrice: number;
  priceMode: string;
  providerName: string;
  providerEmail: string;
  publicationState: ServicePublicationState;
  rejectionReason?: string;
}

export interface ReviewCareServiceDTO {
  action: ServiceModerationAction;
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8081/api/v1/admin';

  constructor(private http: HttpClient) {}

  getPendingProviders(): Observable<ProviderPending[]> {
    return this.http.get<ProviderPending[]>(`${this.apiUrl}/providers/pending`);
  }

  reviewProvider(id: number, dto: ReviewProviderDTO): Observable<ProviderPending> {
    return this.http.put<ProviderPending>(`${this.apiUrl}/providers/${id}/review`, dto);
  }

  requestProviderInfo(id: number, infoMessage: string): Observable<ProviderPending> {
    return this.http.put<ProviderPending>(`${this.apiUrl}/providers/${id}/review`, {
      action: 'request_info',
      infoMessage
    });
  }

  getAllUsers(): Observable<UserStatus[]> {
    return this.http.get<UserStatus[]>(`${this.apiUrl}/users`);
  }

  reviewUser(id: number, dto: ReviewUserDTO): Observable<UserStatus> {
    return this.http.put<UserStatus>(`${this.apiUrl}/users/${id}/review`, dto);
  }

  getPendingCareServices(): Observable<CareServicePending[]> {
    return this.http.get<CareServicePending[]>(`${this.apiUrl}/services/pending`);
  }

  reviewCareService(id: number, dto: ReviewCareServiceDTO): Observable<CareServicePending> {
    return this.http.put<CareServicePending>(`${this.apiUrl}/services/${id}/review`, dto);
  }
}
