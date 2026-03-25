import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth/auth';
import { ProfileService } from '../../services/profile/profile';
import { RegisterUserRequest } from '../../interfaces/auth/register-user-request.interface';
import { ProviderProfileCreateRequest } from '../../interfaces/profile/provider-profile-create.interface';

@Component({
  selector: 'app-register-provider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-provider.html',
  styleUrl: './register-provider.css',
})
export class RegisterProvider {
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
    providerTypeId: [2, [Validators.required]],
    experienceDescription: ['', [Validators.required]],
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    bio: ['', [Validators.required]],
    zone: ['', [Validators.required]],
    phone: ['', [Validators.required]],
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
      roleId: 2,
      userName: formValue.userName ?? '',
      lastName: formValue.lastName ?? '',
      email: formValue.email ?? '',
      password: formValue.password ?? '',
    };

    this.authService.register(userData).pipe(
      switchMap((userResponse) => {
        capturedUserId = userResponse.id;
        const profileData: ProviderProfileCreateRequest = {
          userId: userResponse.id,
          providerTypeId: Number(formValue.providerTypeId ?? 2),
          experienceDescription: formValue.experienceDescription ?? '',
          experienceYears: Number(formValue.experienceYears ?? 0),
          providerState: 'active',
          bio: formValue.bio ?? '',
          zone: formValue.zone ?? '',
          phone: formValue.phone ?? '',
          verified: false,
          insuranceActive: false,
        };
        return this.profileService.createProviderProfile(profileData);
      })
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/biometric-verification'], {
          state: {
            providerData: {
              id: capturedUserId,
              fullName: `${formValue.userName} ${formValue.lastName}`
            },
            userRole: 'provider'
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Ocurrió un error al registrar el proveedor.';
        console.error(error);
      }
    });
  }
}