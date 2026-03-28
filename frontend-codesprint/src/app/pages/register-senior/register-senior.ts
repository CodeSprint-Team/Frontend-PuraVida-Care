import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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
export class RegisterSenior implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly authService    = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router         = inject(Router);

  loading        = false;
  errorMessage   = '';
  successMessage = '';
  isGoogleUser   = false;

  registerForm = this.fb.group({
    userName:              ['', [Validators.required]],
    lastName:              ['', [Validators.required]],
    email:                 ['', [Validators.required, Validators.email]],
    password:              ['', [Validators.required, Validators.minLength(6)]],
    phone:                 ['', [Validators.required]],
    age:                   [null as number | null],
    address:               [''],
    carePreference:        [''],
    emergencyContactName:  ['', [Validators.required]],
    emergencyContactPhone: ['', [Validators.required]],
    emergencyRelation:     [''],
    healthObservation:     [''],
    mobilityNotes:         [''],
    allergies:             ['']
  });

  ngOnInit(): void {
    const userId    = localStorage.getItem('user_id');
    const userName  = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email') ?? '';

    if (userId) {
      this.isGoogleUser = true;
      const nameParts = (userName ?? '').split(' ');
      this.registerForm.patchValue({
        userName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' ') ?? '',
        email:    userEmail
      });
      this.registerForm.get('password')?.clearValidators();
      this.registerForm.get('password')?.updateValueAndValidity();
    }
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading        = true;
    this.errorMessage   = '';
    this.successMessage = '';

    const formValue      = this.registerForm.getRawValue();
    const existingUserId = localStorage.getItem('user_id');

    const createProfile = (userId: number) => {
      const profileData: SeniorProfileCreateRequest = {
        userId,
        phone:                 formValue.phone                ?? '',
        age:                   formValue.age                  ?? undefined,
        address:               formValue.address              ?? '',
        carePreference:        formValue.carePreference       ?? '',
        emergencyContactName:  formValue.emergencyContactName ?? '',
        emergencyContactPhone: formValue.emergencyContactPhone ?? '',
        emergencyRelation:     formValue.emergencyRelation    ?? '',
        healthObservation:     formValue.healthObservation    ?? '',
        mobilityNotes:         formValue.mobilityNotes        ?? '',
        allergies:             formValue.allergies            ?? ''
      };
      return this.profileService.createSeniorProfile(profileData);
    };

    if (existingUserId) {
      // Usuario de Google: actualizar rol a SENIOR (3) y luego crear perfil
      this.authService.updateUserRole(existingUserId, 3).pipe(
        switchMap(() => createProfile(Number(existingUserId)))
      ).subscribe({
        next: () => {
          this.loading = false;
          localStorage.setItem('user_role', 'SENIOR');
          this.router.navigate(['/biometric-verification'], {
            state: {
              adultoMayorData: { id: Number(existingUserId), fullName: `${formValue.userName} ${formValue.lastName}` },
              userRole: 'adulto-mayor'
            }
          });
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Ocurrió un error al crear el perfil.';
          console.error(error);
        }
      });
    } else {
      // Registro normal
      let capturedUserId: number;
      const userData: RegisterUserRequest = {
        roleId:   3,
        userName: formValue.userName ?? '',
        lastName: formValue.lastName ?? '',
        email:    formValue.email    ?? '',
        password: formValue.password ?? ''
      };

      this.authService.register(userData).pipe(
        switchMap((userResponse) => {
          capturedUserId = userResponse.id;
          return createProfile(userResponse.id);
        })
      ).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/biometric-verification'], {
            state: {
              adultoMayorData: { id: capturedUserId, fullName: `${formValue.userName} ${formValue.lastName}` },
              userRole: 'adulto-mayor'
            }
          });
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Ocurrió un error al registrar el perfil.';
          console.error('Error en registro senior:', error);
        }
      });
    }
  }
}