import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../services/profile.services';
import { SeniorProfile, SeniorProfileUpdateDTO } from '../models/senior-profile.model';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, Validators,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroPhoto, heroExclamationTriangle, heroCheckCircle,
  heroLockClosed, heroEye, heroEyeSlash
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroPhoto, heroExclamationTriangle, heroCheckCircle,
    heroLockClosed, heroEye, heroEyeSlash
  })],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.css',
})
export class ProfileEdit implements OnInit {
  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  profileForm!: FormGroup;
  userId        = '';
  imagePreview: string | null = null;
  isLoading     = false;
  isSubmitting  = false;
  statusMessage: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };

  useFamilyAsEmergency = false;
  familyPhone          = '';

  passwordForm!: FormGroup;
  showPasswordSection  = false;
  showCurrentPassword  = false;
  showNewPassword      = false;
  showConfirmPassword  = false;
  isChangingPassword   = false;
  passwordStatus: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.buildForm();
    this.buildPasswordForm();
    if (this.userId) this.loadProfile();
  }

  // ── Formulario principal ──────────────────────────────────────
  private buildForm(): void {
    this.profileForm = this.fb.group({
      userName:              ['', [Validators.required, Validators.minLength(2)]],
      lastName:              ['', [Validators.required, Validators.minLength(2)]],
      email:                 ['', [Validators.required, Validators.email]],
      age:                   [null, [Validators.min(1), Validators.max(120)]],
      phone:                 ['', [Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)]],
      address:               [''],
      profileImage:          [''],
      familyMember:          [''],
      familyRelation:        [''],
      emergencyContactName:  ['', [Validators.required]],
      emergencyContactPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)]],
      emergencyRelation:     [''],
      mobilityNotes:         [''],
      carePreference:        [''],
      healthObservation:     [''],
      allergies:             [''],
    });
  }

  private loadProfile(): void {
    this.profileService.getSeniorProfile(this.userId).subscribe({
      next: (profile: SeniorProfile) => {
        this.imagePreview = profile.profileImage ?? null;
        const parts    = (profile.fullName ?? '').split(' ');
        const userName = parts[0] ?? '';
        const lastName = parts.slice(1).join(' ');
        this.profileForm.patchValue({
          userName, lastName,
          email:                profile.email,
          age:                  profile.age,
          phone:                profile.phone,
          address:              profile.address,
          familyMember:         profile.familyMember,
          familyRelation:       profile.familyRelation,
          emergencyContactName: profile.emergencyContactName,
          emergencyContactPhone:profile.emergencyContactPhone,
          emergencyRelation:    profile.emergencyRelation,
          mobilityNotes:        profile.mobilityNotes,
          carePreference:       profile.carePreference,
          healthObservation:    profile.healthObservation,
          allergies:            profile.allergies,
        });

        // Guardar el teléfono real del familiar
        this.familyPhone = profile.familyPhone ?? '';

        // Detectar si los datos de emergencia coinciden con el familiar
        // para pre-marcar el checkbox si corresponde
        if (
          profile.familyMember &&
          profile.emergencyContactName === profile.familyMember
        ) {
          this.useFamilyAsEmergency = true;
        }
      },
      error: () => this.showStatus('No se pudo cargar el perfil.', 'error')
    });
  }

  // ── Checkbox: copiar datos del familiar al contacto emergencia ─
  onUseFamilyAsEmergencyChange(checked: boolean): void {
    this.useFamilyAsEmergency = checked;

    if (checked) {
      const familyMember   = this.profileForm.get('familyMember')?.value   ?? '';
      const familyRelation = this.profileForm.get('familyRelation')?.value ?? '';
      const phone = this.familyPhone || (this.profileForm.get('phone')?.value ?? '');
      this.profileForm.patchValue({
        emergencyContactName:  familyMember,
        emergencyRelation:     familyRelation,
        emergencyContactPhone: phone,
      });

      this.profileForm.get('emergencyContactName')?.disable();
      this.profileForm.get('emergencyRelation')?.disable();
      this.profileForm.get('emergencyContactPhone')?.disable();
    } else {
      this.profileForm.get('emergencyContactName')?.enable();
      this.profileForm.get('emergencyRelation')?.enable();
      this.profileForm.get('emergencyContactPhone')?.enable();
    }
  }

  handleSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showStatus('Corrige los errores del formulario.', 'error');
      return;
    }
    this.isSubmitting = true;

    const v = this.profileForm.getRawValue();

    const payload: SeniorProfileUpdateDTO = {
      userName:              v.userName,
      lastName:              v.lastName,
      email:                 v.email,
      age:                   v.age,
      phone:                 v.phone,
      address:               v.address,
      profileImage:          this.imagePreview ?? undefined,
      familyMember:          v.familyMember,
      familyRelation:        v.familyRelation,
      emergencyContactName:  v.emergencyContactName,
      emergencyContactPhone: v.emergencyContactPhone,
      emergencyRelation:     v.emergencyRelation,
      mobilityNotes:         v.mobilityNotes,
      carePreference:        v.carePreference,
      healthObservation:     v.healthObservation,
      allergies:             v.allergies,
    };

    this.profileService.updateSeniorProfile(this.userId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showStatus('Perfil actualizado correctamente.', 'success');
        setTimeout(() => this.router.navigate(['/profile', this.userId]), 1200);
      },
      error: () => {
        this.isSubmitting = false;
        this.showStatus('Error al guardar cambios.', 'error');
      }
    });
  }

  handleImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removePhoto(): void { this.imagePreview = null; }

  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, this.passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator() });
  }

  private passwordStrengthValidator(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      if (!c.value) return null;
      const ok = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(c.value);
      return ok ? null : { weakPassword: true };
    };
  }

  private passwordMatchValidator(): ValidatorFn {
    return (g: AbstractControl): ValidationErrors | null => {
      const np = g.get('newPassword')?.value;
      const cp = g.get('confirmPassword')?.value;
      return np === cp ? null : { passwordMismatch: true };
    };
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordForm.reset();
      this.passwordStatus = { text: '', type: null };
    }
  }

  handleChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isChangingPassword = true;
    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordStatus = { text: 'Contraseña actualizada correctamente.', type: 'success' };
      this.passwordForm.reset();
      setTimeout(() => {
        this.passwordStatus = { text: '', type: null };
        this.showPasswordSection = false;
      }, 2500);
    }, 1000);
  }

  getPasswordError(field: string): string {
    const c = this.passwordForm.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required'])     return 'Campo obligatorio.';
    if (c.errors['weakPassword'])
      return 'Mín. 8 caracteres, mayúscula, minúscula, número y símbolo.';
    return '';
  }

  get passwordMismatch(): boolean {
    return !!(this.passwordForm.errors?.['passwordMismatch']
      && this.passwordForm.get('confirmPassword')?.touched);
  }

  handleCancel(): void { this.router.navigate(['/profile', this.userId]); }

  private showStatus(text: string, type: 'success' | 'error'): void {
    this.statusMessage = { text, type };
    setTimeout(() => this.statusMessage = { text: '', type: null }, 4000);
  }

  getFieldError(field: string): string {
    const c = this.profileForm.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required'])  return 'Campo obligatorio.';
    if (c.errors['email'])     return 'Correo inválido.';
    if (c.errors['pattern'])   return 'Formato requerido: 8888-7777.';
    if (c.errors['min'])       return 'Valor demasiado bajo.';
    if (c.errors['max'])       return 'Valor demasiado alto.';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    return 'Dato inválido.';
  }

  isInvalid(field: string): boolean {
    const c = this.profileForm.get(field);
    return !!(c?.invalid && c.touched);
  }
}