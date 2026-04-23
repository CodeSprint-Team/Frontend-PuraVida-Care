import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FamilyProfileEdit implements OnInit {
  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private cdr            = inject(ChangeDetectorRef);

  profileForm!: FormGroup;
  originalProfile!: FamilyProfile;
  imagePreview: string | null = null;
  imageRemoved = false;
  selectedFileError = '';
  isLoading         = false;
  isSubmitting      = false;

  profileId = '';
  userId    = '';

  passwordForm!: FormGroup;
  showPasswordSection  = false;
  showCurrentPassword  = false;
  showNewPassword      = false;
  showConfirmPassword  = false;
  isChangingPassword   = false;
  passwordStatus: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };

  ngOnInit(): void {
    this.profileId = this.route.snapshot.paramMap.get('id') ?? '';
    this.userId    = localStorage.getItem('user_id') ?? '';
    this.buildForm();
    this.buildPasswordForm();
    this.loadProfile();
  }

  private buildForm(): void {
    this.profileForm = this.fb.group({
      fullName:         ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email:            ['', [Validators.required, Validators.email]],
      phone:            ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)]],
      relationToSenior: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emergencyName:    ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      emergencyRelation:['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      emergencyPhone:   ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)]],
      importantNotes:   ['', [Validators.maxLength(300)]],
    });
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.profileService.getFamilyProfile(this.profileId).subscribe({
      next: (data) => {
        this.originalProfile = data;
        this.imagePreview    = data.profileImage || null;
        this.imageRemoved    = false;

        this.profileForm.patchValue({
          fullName:          data.fullName,
          email:             data.email ?? '',
          phone:             data.phone,
          relationToSenior:  data.relationToSenior ?? '',
          emergencyName:     data.emergencyContactName ?? data.emergencyName ?? '',
          emergencyRelation: data.emergencyContactRelation ?? data.emergencyRelation ?? '',
          emergencyPhone:    data.emergencyContactPhone ?? data.emergencyPhone ?? '',
          importantNotes:    data.importantNotes ?? data.notes ?? '',
        });

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  handleSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const v = this.profileForm.value;

    let finalProfileImage: string | null;

    if (this.imageRemoved) {
      finalProfileImage = null;
    } else if (this.imagePreview) {
      finalProfileImage = this.imagePreview;
    } else {
      finalProfileImage = null;
    }

    const updatedProfile: Partial<FamilyProfile> = {
      ...this.originalProfile,
      fullName:          v.fullName.trim(),
      email:             v.email.trim(),
      phone:             v.phone.trim(),
      profileImage:      finalProfileImage,
      relationToSenior:  v.relationToSenior.trim(),
      emergencyName:     v.emergencyName.trim(),
      emergencyRelation: v.emergencyRelation.trim(),
      emergencyPhone:    v.emergencyPhone.trim(),
      importantNotes:    v.importantNotes?.trim() || '',
    };

    this.profileService.updateFamilyProfile(this.profileId, updatedProfile).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
        this.router.navigate(['/family-profile', this.userId]);
      },
      error: () => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  handleCancel(): void {
    this.router.navigate(['/family-profile', this.userId]);
  }

  handleImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.selectedFileError = '';
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.selectedFileError = 'Solo se permiten imágenes JPG, PNG o WEBP.';
      this.cdr.markForCheck();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.selectedFileError = 'La imagen no puede superar los 5MB.';
      this.cdr.markForCheck();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.imageRemoved = false;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.imagePreview      = null;
    this.imageRemoved      = true;
    this.selectedFileError = '';

    this.cdr.markForCheck();
  }

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
    this.cdr.markForCheck();
  }

  handleChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.isChangingPassword = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordStatus = { text: 'Contraseña actualizada correctamente.', type: 'success' };
      this.passwordForm.reset();
      this.cdr.markForCheck();

      setTimeout(() => {
        this.passwordStatus = { text: '', type: null };
        this.showPasswordSection = false;
        this.cdr.markForCheck();
      }, 2500);
    }, 1000);
  }

  getPasswordError(field: string): string {
    const c = this.passwordForm.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required'])     return 'Campo obligatorio.';
    if (c.errors['weakPassword']) {
      return 'Mín. 8 caracteres, mayúscula, minúscula, número y símbolo.';
    }
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
    if (field.errors['minlength']) {
      return `Debe tener al menos ${field.errors['minlength'].requiredLength} caracteres.`;
    }
    if (field.errors['maxlength']) {
      return `No debe superar ${field.errors['maxlength'].requiredLength} caracteres.`;
    }
    if (field.errors['pattern'])   return 'Usa el formato 8888-7777.';
    return 'Campo inválido.';
  }
}