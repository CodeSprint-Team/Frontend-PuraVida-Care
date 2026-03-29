import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class RegisterClient implements OnInit {
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
    userName:                 ['', [Validators.required]],
    lastName:                 ['', [Validators.required]],
    email:                    ['', [Validators.required, Validators.email,
                                   Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password:                 ['', [Validators.required, Validators.minLength(8)]],
    phone:                    ['', [Validators.required]],
    notes:                    [''],
    relationToSenior:         ['', [Validators.required]],
    emergencyContactName:     ['', [Validators.required]],
    emergencyContactRelation: ['', [Validators.required]],
    emergencyContactPhone:    ['', [Validators.required]],
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

    const buildProfile = (userId: number): ClientProfileCreateRequest => ({
      userId,
      phone:                    formValue.phone                    ?? '',
      notes:                    formValue.notes                    ?? '',
      relationToSenior:         formValue.relationToSenior         ?? '',
      emergencyContactName:     formValue.emergencyContactName     ?? '',
      emergencyContactRelation: formValue.emergencyContactRelation ?? '',
      emergencyContactPhone:    formValue.emergencyContactPhone    ?? '',
      importantNotes:           formValue.importantNotes           ?? ''
    });

    const onSuccess = (userId: number) => {
      this.loading = false;
      if (this.isGoogleUser) {
        localStorage.setItem('user_role', 'CLIENT');
      }
      this.router.navigate(['/biometric-verification'], {
        state: {
          clientData: {
            id: userId,
            fullName: `${formValue.userName} ${formValue.lastName}`
          },
          userRole: 'client'
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
        this.errorMessage = msg || 'Ocurrió un error al registrar.';
      }
      this.cdr.detectChanges();
    };

    if (existingUserId) {
      // ── Usuario Google: actualizar rol y crear perfil ──
      this.authService.updateUserRole(existingUserId, 1).pipe(
        switchMap(() => this.profileService.createClientProfile(buildProfile(Number(existingUserId))))
      ).subscribe({
        next: () => onSuccess(Number(existingUserId)),
        error: onError
      });
    } else {
      // ── Registro normal ──
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
          return this.profileService.createClientProfile(buildProfile(userResponse.id));
        })
      ).subscribe({
        next: () => onSuccess(capturedUserId),
        error: onError
      });
    }
  }
}