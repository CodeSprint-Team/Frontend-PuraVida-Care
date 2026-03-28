import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';
  errorType: 'not_found' | 'credentials' | 'generic' = 'generic';
  showPassword = false;

  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cdr         = inject(ChangeDetectorRef);

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) return;

    this.loading = true;

    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }).subscribe({
      next: (response) => {
        this.loading = false;
        localStorage.setItem('user_id', String(response.userId));
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('user_email', response.email ?? '');
        localStorage.setItem('user_name', response.userName ?? '');
        localStorage.setItem('user_data', JSON.stringify(response));

        this.redirectByRole(response.role, String(response.userId), false);
      },
      error: (error) => {
        this.loading = false;
        const status = error?.status;
        const msg = error?.error?.error || '';

        if (status === 0) {
          this.errorType = 'generic';
          this.errorMessage = 'No se pudo conectar con el servidor.';
        } else if (status === 401) {
          if (msg.toLowerCase().includes('credenciales')) {
            this.errorType = 'credentials';
            this.errorMessage = 'Correo o contraseña incorrectos.';
          } else {
            this.errorType = 'not_found';
            this.errorMessage = 'Este correo no está registrado.';
          }
        } else if (status === 404) {
          this.errorType = 'not_found';
          this.errorMessage = 'Este correo no está registrado.';
        } else {
          this.errorType = 'generic';
          this.errorMessage = msg || 'Error al iniciar sesión.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  loginWithGoogle(): void {
    const google = (window as any).google;
    if (!google) {
      this.errorMessage = 'Google no está disponible. Recargá la página.';
      return;
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: environment.googleClientId,
      scope: 'email profile',
      callback: (tokenResponse: any) => {
        if (tokenResponse?.access_token) {
          this.loading = true;
          this.errorMessage = '';

          this.authService.loginWithGoogle(tokenResponse.access_token).subscribe({
            next: (response: any) => {
              this.loading = false;
              localStorage.setItem('user_id', String(response.userId));
              localStorage.setItem('user_role', response.role);
              localStorage.setItem('user_email', response.email ?? '');
              localStorage.setItem('user_name', response.userName ?? '');
              localStorage.setItem('user_data', JSON.stringify(response));

              this.redirectByRole(response.role, String(response.userId), response.isNewUser);
            },
            error: (error: any) => {
              this.loading = false;
              this.errorMessage = error?.error?.error || 'Error al iniciar sesión con Google';
              this.cdr.detectChanges();
            }
          });
        } else {
          this.errorMessage = 'No se pudo obtener el token de Google';
        }
      }
    });
    client.requestAccessToken();
  }

  private redirectByRole(role: string, userId: string, isNewUser: boolean): void {
    if (isNewUser) {
      this.router.navigate(['/register/role']);
      return;
    }

    switch (role) {
      case 'PROVIDER':
        this.router.navigate(['/provider-profile', userId]);
        break;
      case 'CLIENT':
        this.router.navigate(['/family-profile', userId]);
        break;
      case 'SENIOR':
        this.router.navigate(['/profile', userId]);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin-dashboard']);
        break;
      default:
        this.router.navigate(['/home']);
        break;
    }
  }
}