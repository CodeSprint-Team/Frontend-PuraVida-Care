import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, FormGroup, ReactiveFormsModule, Validators, 
  AbstractControl, ValidationErrors, ValidatorFn 
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ProfileService } from '../services/profile.services';
import { AdminProfile, AdminProfileUpdateDTO } from '../models/admin-profile.model';
import {
  heroArrowLeft, heroPhoto, heroExclamationTriangle, heroCheckCircle,
  heroLockClosed, heroEye, heroEyeSlash, heroUser, heroEnvelope, heroTrash, heroPencilSquare
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroPhoto, heroExclamationTriangle, heroCheckCircle,
    heroLockClosed, heroEye, heroEyeSlash, heroUser, heroEnvelope, heroTrash, heroPencilSquare
  })],
  templateUrl: './admin-profile-edit.html',
  styleUrl: './admin-profile-edit.css',
})
export class AdminProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  // Formularios
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // Estados
  userId = '';
  imagePreview: string | null = null;
  isSubmitting = false;
  isChangingPassword = false;
  
  statusMessage: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };
  passwordStatus: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };

  // UI Toggles
  showPasswordSection = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? localStorage.getItem('user_id') ?? '';
    this.buildForm();
    this.buildPasswordForm();
    if (this.userId) this.loadProfile();
  }

  private buildForm(): void {
    this.profileForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, this.passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator() });
  }

  private loadProfile(): void {
    this.profileService.getAdminProfile(this.userId).subscribe({
      next: (profile) => {
        this.imagePreview = profile.photoUrl ?? null;
        const parts = (profile.fullName ?? '').split(' ');
        
        this.profileForm.patchValue({
          userName: parts[0] ?? '',
          lastName: parts.slice(1).join(' ') || '',
          email: profile.email
        });
      },
      error: () => this.showStatus('No se pudo cargar el perfil.', 'error')
    });
  }

  // ── Gestión de Imagen ──
  handleImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removePhoto(): void { this.imagePreview = null; }

  // ── Guardado de Perfil ──
  handleSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const v = this.profileForm.value;
    
    const payload: AdminProfileUpdateDTO = {
      userName: v.userName,
      lastName: v.lastName,
      email: v.email,
      photoUrl: this.imagePreview ?? ''
    };

    this.profileService.updateAdminProfile(this.userId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showStatus('Perfil actualizado correctamente.', 'success');
        setTimeout(() => this.goBack(), 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showStatus(err?.error?.message || 'Error al guardar cambios.', 'error');
      }
    });
  }

  // ── Cambio de Contraseña ──
  handleChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword = true;
    const v = this.passwordForm.value;

    const payload: AdminProfileUpdateDTO = {
      ...this.profileForm.value,
      photoUrl: this.imagePreview ?? '',
      currentPassword: v.currentPassword,
      newPassword: v.newPassword
    };

    this.profileService.updateAdminProfile(this.userId, payload).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordStatus = { text: 'Contraseña actualizada correctamente.', type: 'success' };
        this.passwordForm.reset();
        setTimeout(() => {
          this.passwordStatus = { text: '', type: null };
          this.showPasswordSection = false;
        }, 2500);
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordStatus = { text: err?.error?.message || 'Error al cambiar contraseña.', type: 'error' };
      }
    });
  }

  // ── Validadores y Helpers ──
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

  getFieldError(field: string): string {
    const c = this.profileForm.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required']) return 'Campo obligatorio.';
    if (c.errors['email']) return 'Correo inválido.';
    return 'Dato inválido.';
  }

  getPasswordError(field: string): string {
    const c = this.passwordForm.get(field);
    if (!c?.touched || !c.errors) return '';
    if (c.errors['required']) return 'Campo obligatorio.';
    if (c.errors['weakPassword']) return 'Debe ser más fuerte (8+ carac, Mayús, Núm, Símbolo).';
    return '';
  }

  get passwordMismatch(): boolean {
    return !!(this.passwordForm.errors?.['passwordMismatch'] && this.passwordForm.get('confirmPassword')?.touched);
  }

  private showStatus(text: string, type: 'success' | 'error'): void {
    this.statusMessage = { text, type };
    setTimeout(() => this.statusMessage = { text: '', type: null }, 4000);
  }

  goBack(): void {
    this.router.navigate(['/admin-profile', this.userId]);
  }
}