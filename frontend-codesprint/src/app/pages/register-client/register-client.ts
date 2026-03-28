import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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
export class RegisterClient implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly authService    = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router         = inject(Router);

  loading        = false;
  errorMessage   = '';
  successMessage = '';
  isGoogleUser   = false;

  registerForm = this.fb.group({
    userName:                 ['', [Validators.required]],
    lastName:                 ['', [Validators.required]],
    email:                    ['', [Validators.required, Validators.email]],
    password:                 ['', [Validators.required, Validators.minLength(6)]],
    phone:                    ['', [Validators.required]],
    notes:                    [''],
    relationToSenior:         [''],
    emergencyContactName:     [''],
    emergencyContactRelation: [''],
    emergencyContactPhone:    [''],
    importantNotes:           ['']
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
      const profileData: ClientProfileCreateRequest = {
        userId,
        phone:                    formValue.phone                    ?? '',
        notes:                    formValue.notes                    ?? '',
        relationToSenior:         formValue.relationToSenior         ?? '',
        emergencyContactName:     formValue.emergencyContactName     ?? '',
        emergencyContactRelation: formValue.emergencyContactRelation ?? '',
        emergencyContactPhone:    formValue.emergencyContactPhone    ?? '',
        importantNotes:           formValue.importantNotes           ?? ''
      };
      return this.profileService.createClientProfile(profileData);
    };

    if (existingUserId) {
      // Usuario de Google: actualizar rol a CLIENT (1) y luego crear perfil
      this.authService.updateUserRole(existingUserId, 1).pipe(
        switchMap(() => createProfile(Number(existingUserId)))
      ).subscribe({
        next: () => {
          this.loading = false;
          localStorage.setItem('user_role', 'CLIENT');
          this.router.navigate(['/biometric-verification'], {
            state: {
              clientData: { id: Number(existingUserId), fullName: `${formValue.userName} ${formValue.lastName}` },
              userRole: 'client'
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
        roleId:   1,
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
              clientData: { id: capturedUserId, fullName: `${formValue.userName} ${formValue.lastName}` },
              userRole: 'client'
            }
          });
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Ocurrió un error al registrar.';
          console.error(error);
        }
      });
    }
  }
}