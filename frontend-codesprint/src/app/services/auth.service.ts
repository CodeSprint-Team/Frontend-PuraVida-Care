import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly authUrl = `${environment.apiUrl}/auth`;

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_id', String(response.userId));
          localStorage.setItem('user_role', response.role);
          localStorage.setItem('user_name', response.name ?? '');
          localStorage.setItem('user_email', response.email ?? '');
        }
      })
    );
  }

  loginWithGoogle(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/google/callback`, { token: accessToken }).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_id', String(response.userId));
          localStorage.setItem('user_role', response.role);
          localStorage.setItem('user_name', response.name ?? '');
          localStorage.setItem('user_email', response.email ?? '');
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
    this.router.navigate(['/login']);
  }
}