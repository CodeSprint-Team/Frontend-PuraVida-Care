import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth/auth';
import { ProfileService } from '../../services/profile/profile';
import { RegisterUserRequest } from '../../interfaces/auth/register-user-request.interface';
import { SeniorProfileCreateRequest } from '../../interfaces/profile/senior-profile-create.interface';

@Component({
  selector: 'app-register-senior',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-senior.html',
  styleUrl: './register-senior.css',
})
export class RegisterSenior {
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
    age: [null],
    address: [''],
    carePreference: [''],
    emergencyContactName: ['', [Validators.required]],
    emergencyContactPhone: ['', [Validators.required]],
    emergencyRelation: [''],
    healthObservation: [''],
    mobilityNotes: [''],
    allergies: ['']
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
    let capturedUserId: number;

    const userData: RegisterUserRequest = {
      roleId: 3,
      userName: formValue.userName ?? '',
      lastName: formValue.lastName ?? '',
      email: formValue.email ?? '',
      password: formValue.password ?? ''
    };

    this.authService.register(userData).pipe(
      switchMap((userResponse) => {
        capturedUserId = userResponse.id;
        const profileData: SeniorProfileCreateRequest = {
          userId: userResponse.id,
          phone: formValue.phone ?? '',
          age: formValue.age ?? undefined,
          address: formValue.address ?? '',
          carePreference: formValue.carePreference ?? '',
          emergencyContactName: formValue.emergencyContactName ?? '',
          emergencyContactPhone: formValue.emergencyContactPhone ?? '',
          emergencyRelation: formValue.emergencyRelation ?? '',
          healthObservation: formValue.healthObservation ?? '',
          mobilityNotes: formValue.mobilityNotes ?? '',
          allergies: formValue.allergies ?? ''
        };
        return this.profileService.createSeniorProfile(profileData);
      })
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/biometric-verification'], {
          state: {
            adultoMayorData: {
              id: capturedUserId,
              fullName: `${formValue.userName} ${formValue.lastName}`
            },
            userRole: 'adulto-mayor'
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Ocurrió un error al registrar el perfil.';
        console.error('Error en registro senior:', error);
      }
    });
  }
}