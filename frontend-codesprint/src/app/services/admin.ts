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

// ── interfaces para usuarios
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

  // ── métodos para usuarios
  getAllUsers(): Observable<UserStatus[]> {
    return this.http.get<UserStatus[]>(`${this.apiUrl}/users`);
  }

  reviewUser(id: number, dto: ReviewUserDTO): Observable<UserStatus> {
    return this.http.put<UserStatus>(`${this.apiUrl}/users/${id}/review`, dto);
  }
}
