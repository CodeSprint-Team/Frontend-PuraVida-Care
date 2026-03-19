import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/v1/auth';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  loginWithGoogle() {
    this.http.get<{url: string}>(`${this.apiUrl}/google/url`).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Error obteniendo URL de Google', error);
      }
    });
  }

  handleAuthCallback(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.loadUser();
    this.router.navigate(['/dashboard']);
  }

  private loadUser() {
    const token = this.getToken();
    if (token) {
      this.http.get(`${this.apiUrl}/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response: any) => this.userSubject.next(response.user),
        error: () => this.logout()
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
