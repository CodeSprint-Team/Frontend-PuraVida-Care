import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { RegisterUserRequest } from '../interfaces/auth/register-user-request.interface';
import { UserResponse } from '../interfaces/auth/user-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http    = inject(HttpClient);
  private readonly router  = inject(Router);
  private readonly apiUrl  = `${environment.apiUrl}/users`;
  private readonly authUrl = `${environment.apiUrl}/auth`;

  register(data: RegisterUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, data);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response?.token) {
          this.saveSession(response);
        }
      })
    );
  }

  loginWithGoogle(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/google/callback`, { token: accessToken }).pipe(
      tap((response) => {
        if (response?.token) {
          this.saveSession(response);
        }
      })
    );
  }

  updateUserRole(userId: string, roleId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}/role`, { roleId });
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getUserName(): string | null {
    return localStorage.getItem('user_name');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_data');
    this.router.navigate(['/login']);
  }

  private saveSession(response: any): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_id', String(response.userId));
    localStorage.setItem('user_role', response.role);
    localStorage.setItem('user_name', response.name ?? '');
    localStorage.setItem('user_email', response.email ?? '');
  }
}