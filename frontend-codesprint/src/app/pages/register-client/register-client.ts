import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth/auth';
import { ProfileService } from '../../services/profile/profile';
import { RegisterUserRequest } from '../../interfaces/auth/register-user-request.interface';
import { ClientProfileCreateRequest } from '../../interfaces/profile/client-profile-create.interface';

@Component({
  selector: 'app-register-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-client.html',
  styleUrl: './register-client.css',
})
export class RegisterClient {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

 registerForm = this.fb.group({
  userName: ['', [Validators.required]],
  lastName: ['', [Validators.required]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  phone: ['', [Validators.required]],
  notes: [''],
  relationToSenior: [''],
  emergencyContactName: [''],
  emergencyContactRelation: [''],
  emergencyContactPhone: [''],
  importantNotes: ['']
});

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.getRawValue();

    const userData: RegisterUserRequest = {
      roleId: 1,
      userName: formValue.userName ?? '',
      lastName: formValue.lastName ?? '',
      email: formValue.email ?? '',
      password: formValue.password ?? ''
    };

    this.authService.register(userData).pipe(
      switchMap((userResponse) => {
        const profileData: ClientProfileCreateRequest = {
          userId: userResponse.id,
          phone: formValue.phone ?? '',
          notes: formValue.notes ?? '',
          relationToSenior: formValue.relationToSenior ?? '',
          emergencyContactName: formValue.emergencyContactName ?? '',
          emergencyContactRelation: formValue.emergencyContactRelation ?? '',
          emergencyContactPhone: formValue.emergencyContactPhone ?? '',
          importantNotes: formValue.importantNotes ?? ''
        };

        return this.profileService.createClientProfile(profileData);
      })
    ).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Registro completado correctamente.';
        this.registerForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Ocurrió un error al registrar.';
        console.error(error);
      }
    });
  }
}