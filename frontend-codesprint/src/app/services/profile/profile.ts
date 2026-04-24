import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientProfileCreateRequest } from '../../interfaces/profile/client-profile-create.interface';
import { ProviderProfileCreateRequest } from '../../interfaces/profile/provider-profile-create.interface';
import { SeniorProfileCreateRequest } from '../../interfaces/profile/senior-profile-create.interface';
import {ProviderProfile} from '../../pages/viewProfile/models/provider-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profiles`;

  createClientProfile(data: ClientProfileCreateRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/client`, data);
  }

  createProviderProfile(data: ProviderProfileCreateRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/provider`, data);
  }

  createSeniorProfile(data: SeniorProfileCreateRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/senior`, data);
  }

  getProviderProfile(providerId: string): Observable<ProviderProfile> {
    return this.http.get<ProviderProfile>(`${this.apiUrl}/provider/${providerId}`);
  }

  getSeniorProfileByUserId(userId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/senior/by-user/${userId}`);
  }

  getClientProfileByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/client/by-user/${userId}`);
  }
}
