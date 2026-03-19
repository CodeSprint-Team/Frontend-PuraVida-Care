// src/app/viewProfile/family-profile-edit/family-profile-edit.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, Validators,
  AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ProfileService } from '../services/profile.services';
import { FamilyProfile } from '../models/family-profile.model';
import {
  heroArrowLeft, heroLockClosed, heroEye, heroEyeSlash,
  heroCheckCircle, heroExclamationTriangle
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-family-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroLockClosed, heroEye, heroEyeSlash,
    heroCheckCircle, heroExclamationTriangle
  })],
  templateUrl: './family-profile-edit.html',
  styleUrl: './family-profile-edit.css',
})
export class FamilyProfileEdit implements OnInit {
  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  profileForm!: FormGroup;
  originalProfile!: FamilyProfile;
  imagePreview: string | null = null;
  selectedFileError = '';
  isLoading         = false;
  isSubmitting      = false;
  userId            = '';

  // ── Contraseña ────────────────────────────────────────────────
  passwordForm!: FormGroup;
  showPasswordSection  = false;
  showCurrentPassword  = false;
  showNewPassword      = false;
  showConfirmPassword  = false;
  isChangingPassword   = false;
  passwordStatus: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '1';
    this.buildForm();
    this.buildPasswordForm();
    this.loadProfile();
  }

  // ── Formulario principal ──────────────────────────────────────
  private buildForm(): void {
    this.profileForm = this.fb.group({
      fullName:         ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email:            ['', [Validators.required, Validators.email]],   // ✅ email agregado
      phone:            ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)]],
      relationToSenior: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emergencyName:    ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      emergencyRelation:['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emergencyPhone:   ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)]],
      importantNotes:   ['', [Validators.maxLength(300)]],
    });
  }

  private loadProfile(): void {
    this.profileService.getFamilyProfile(this.userId).subscribe({
      next: (data) => {
        this.originalProfile = data;
        this.imagePreview    = data.profileImage || null;

        this.profileForm.patchValue({
          fullName:          data.fullName,
          email:             data.email                                        ?? '',  // ✅
          phone:             data.phone,
          relationToSenior:  data.relationToSenior                             ?? '',
          emergencyName:     data.emergencyContactName ?? data.emergencyName   ?? '',
          emergencyRelation: data.emergencyContactRelation ?? data.emergencyRelation ?? '',
          emergencyPhone:    data.emergencyContactPhone ?? data.emergencyPhone ?? '',
          importantNotes:    data.importantNotes ?? data.notes                 ?? '',
        });
      },
      error: (err) => console.error('Error cargando perfil familiar:', err)
    });
  }

  handleSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const v = this.profileForm.value;

    const updatedProfile: Partial<FamilyProfile> = {
      ...this.originalProfile,
      fullName:          v.fullName.trim(),
      email:             v.email.trim(),       // ✅ email incluido en el save
      phone:             v.phone.trim(),
      profileImage:      this.imagePreview,
      relationToSenior:  v.relationToSenior.trim(),
      emergencyName:     v.emergencyName.trim(),
      emergencyRelation: v.emergencyRelation.trim(),
      emergencyPhone:    v.emergencyPhone.trim(),
      importantNotes:    v.importantNotes?.trim() || '',
    };

    this.profileService.updateFamilyProfile(this.userId, updatedProfile).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/family-profile', this.userId]);
      },
      error: (err) => {
        console.error('Error guardando perfil:', err);
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.router.navigate(['/family-profile', this.userId]);
  }

  // ── Imagen ────────────────────────────────────────────────────
  handleImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.selectedFileError = '';
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.selectedFileError = 'Solo se permiten imágenes JPG, PNG o WEBP.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.selectedFileError = 'La imagen no puede superar los 5MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.imagePreview      = null;
    this.selectedFileError = '';
  }

  // ── Contraseña ────────────────────────────────────────────────
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

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field?.touched || !field.errors) return '';
    if (field.errors['required'])  return 'Este campo es obligatorio.';
    if (field.errors['email'])     return 'Correo electrónico inválido.';
    if (field.errors['minlength'])
      return `Debe tener al menos ${field.errors['minlength'].requiredLength} caracteres.`;
    if (field.errors['maxlength'])
      return `No debe superar ${field.errors['maxlength'].requiredLength} caracteres.`;
    if (field.errors['pattern'])   return 'Usa el formato 8888-7777.';
    return 'Campo inválido.';
  }
}