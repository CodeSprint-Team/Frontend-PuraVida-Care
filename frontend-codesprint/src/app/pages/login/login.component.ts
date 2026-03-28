import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
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
      next: (response: any) => {
        this.loading = false;
        this.redirectByRole(response.role, String(response.userId), false);
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Credenciales incorrectas';
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

          // Enviamos el token sin roleId — el backend usa CLIENT por defecto
          // Si el usuario es nuevo, lo mandamos a elegir rol
          this.authService.loginWithGoogle(tokenResponse.access_token).subscribe({
            next: (response: any) => {
              this.loading = false;
              this.redirectByRole(response.role, String(response.userId), response.isNewUser);
            },
            error: (error: any) => {
              this.loading = false;
              this.errorMessage = error?.error?.error || 'Error al iniciar sesión con Google';
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
    // Usuario nuevo con Google → elegir rol
    if (isNewUser) {
      this.router.navigate(['/register/role']);
      return;
    }

    // Usuario existente → ir a su perfil según rol
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