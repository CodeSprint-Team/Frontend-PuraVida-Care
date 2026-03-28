import { Component, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth/auth';

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

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

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
        // Guardá toda la info que te devuelve el backend
        localStorage.setItem('user_id', String(response.userId));
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('user_email', response.email ?? '');
        localStorage.setItem('user_name', response.userName ?? '');

        // Si querés guardar todo el objeto:
        localStorage.setItem('user_data', JSON.stringify(response));

        this.redirectByRole(response.role, String(response.userId));
      },
error: (error) => {
  this.loading = false;  // ← PRIMERO esto

  const status = error?.status;
  const msg = error?.error?.error || '';

  console.log('Status:', status, 'Msg:', msg);

  if (status === 0) {
    this.errorType = 'generic';
    this.errorMessage = 'No se pudo conectar con el servidor.';
  } else if (status === 401) {
    // El backend devuelve 401 para todo — diferenciamos por mensaje
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

  this.cdr.detectChanges();  // ← forzar update
}
    });
  }

  private redirectByRole(role: string, userId: string): void {
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

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8081/api/v1/auth/google/url';
  }
}