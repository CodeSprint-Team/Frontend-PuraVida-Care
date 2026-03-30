import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  registerForm = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.registerForm.getRawValue();

    this.authService.register({
      roleId: 1,
      userName: formValue.userName ?? '',
      lastName: formValue.lastName ?? '',
      email: formValue.email ?? '',
      password: formValue.password ?? ''
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = `Usuario ${response.userName} registrado correctamente.`;
        this.registerForm.reset();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'No se pudo registrar el usuario.';
      }
    });
  }

  get userName() {
    return this.registerForm.get('userName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
}