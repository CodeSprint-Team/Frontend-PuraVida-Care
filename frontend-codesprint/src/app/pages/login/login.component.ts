import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth/auth';

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

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor(private formBuilder: FormBuilder) {}

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
      next: (response) => {
        this.loading = false;
        this.redirectByRole(response.role, String(response.userId));
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.error || 'Credenciales incorrectas';
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