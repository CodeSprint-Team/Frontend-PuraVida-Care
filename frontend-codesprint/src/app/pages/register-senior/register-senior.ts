import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef} from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  registerForm = this.fb.group({
    userName:              ['', [Validators.required]],
    lastName:              ['', [Validators.required]],
    email:                 ['', [Validators.required, Validators.email,
                                Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password:              ['', [Validators.required, Validators.minLength(8)]],
    phone:                 ['', [Validators.required]],
    age:                   [null as number | null, [Validators.required, Validators.min(1)]],
    address:               ['', [Validators.required]],
    carePreference:        ['', [Validators.required]],
    emergencyContactName:  ['', [Validators.required]],
    emergencyContactPhone: ['', [Validators.required]],
    emergencyRelation:     ['', [Validators.required]],
    healthObservation:     [''],
    mobilityNotes:         [''],
    allergies:             ['']
  });

  /** Helper para validación en el template */
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
        const status = error?.status;
        const msg = error?.error?.error || error?.error?.message || '';

        console.log('Status:', status, 'Msg:', msg);

        if (status === 409 || msg.toLowerCase().includes('ya existe') || msg.toLowerCase().includes('already')) {
          this.errorMessage = 'Este correo ya está registrado. Intentá con otro.';
        } else if (status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
        } else {
          this.errorMessage = msg || 'Ocurrió un error al registrar el perfil.';
        }

        this.cdr.detectChanges();

      }
    });
  }
}