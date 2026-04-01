import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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
export class RegisterProvider implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly authService    = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router         = inject(Router);
  private readonly cdr            = inject(ChangeDetectorRef);

  loading        = false;
  errorMessage   = '';
  successMessage = '';
  showPassword   = false;
  isGoogleUser   = false;

  registerForm = this.fb.group({
    userName:              ['', [Validators.required]],
    lastName:              ['', [Validators.required]],
    email:                 ['', [Validators.required, Validators.email,
                                Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password:              ['', [Validators.required, Validators.minLength(8)]],
    providerTypeId:        [2, [Validators.required]],
    experienceDescription: ['', [Validators.required]],
    experienceYears:       [0, [Validators.required, Validators.min(0)]],
    bio:                   ['', [Validators.required]],
    zone:                  ['', [Validators.required]],
    phone:                 ['', [Validators.required]],
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

  isInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Por favor completá todos los campos obligatorios.';
      return;
    }

    this.loading        = true;
    this.errorMessage   = '';
    this.successMessage = '';

    const formValue      = this.registerForm.getRawValue();
    const existingUserId = localStorage.getItem('user_id');

    const buildProfile = (userId: number): ProviderProfileCreateRequest => ({
      userId,
      providerTypeId:        Number(formValue.providerTypeId ?? 2),
      experienceDescription: formValue.experienceDescription ?? '',
      experienceYears:       Number(formValue.experienceYears ?? 0),
      providerState:         'pending',
      bio:                   formValue.bio   ?? '',
      zone:                  formValue.zone  ?? '',
      phone:                 formValue.phone ?? '',
      verified:              false,
      insuranceActive:       false,
    });

    const onSuccess = (userId: number) => {
      this.loading = false;
      if (this.isGoogleUser) {
        localStorage.setItem('user_role', 'PROVIDER');
      }
      this.router.navigate(['/biometric-verification'], {
        state: {
          providerData: {
            id: userId,
            fullName: `${formValue.userName} ${formValue.lastName}`
          },
          userRole: 'provider'
        }
      });
    };

    const onError = (error: any) => {
      this.loading = false;
      const status = error?.status;
      const msg = error?.error?.error || error?.error?.message || '';

      if (status === 409 || msg.toLowerCase().includes('ya existe') || msg.toLowerCase().includes('already')) {
        this.errorMessage = 'Este correo ya está registrado. Intentá con otro.';
      } else if (status === 0) {
        this.errorMessage = 'No se pudo conectar con el servidor.';
      } else {
        this.errorMessage = msg || 'Ocurrió un error al registrar el perfil.';
      }
      this.cdr.detectChanges();
    };

    if (existingUserId) {
      // ── Usuario Google: actualizar rol y crear perfil ──
      this.authService.updateUserRole(existingUserId, 2).pipe(
        switchMap(() => this.profileService.createProviderProfile(buildProfile(Number(existingUserId))))
      ).subscribe({
        next: () => onSuccess(Number(existingUserId)),
        error: onError
      });
    } else {
      // ── Registro normal ──
      let capturedUserId: number;
      const userData: RegisterUserRequest = {
        roleId:   2,
        userName: formValue.userName ?? '',
        lastName: formValue.lastName ?? '',
        email:    formValue.email    ?? '',
        password: formValue.password ?? '',
      };

      this.authService.register(userData).pipe(
        switchMap((userResponse) => {
          capturedUserId = userResponse.id;
          return this.profileService.createProviderProfile(buildProfile(userResponse.id));
        })
      ).subscribe({
        next: () => onSuccess(capturedUserId),
        error: onError
      });
    }
  }
}