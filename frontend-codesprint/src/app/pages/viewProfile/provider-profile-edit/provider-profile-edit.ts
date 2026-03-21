import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ProfileService } from '../services/profile.services';
import { ProviderProfile, ProviderProfileUpdateDTO } from '../models/provider-profile.model';
import {
  heroArrowLeft, heroPhoto, heroCheckCircle, heroExclamationTriangle,
  heroPlus, heroTrash, heroBriefcase, heroMapPin,
  heroPhone, heroEnvelope, heroPencilSquare
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-provider-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroPhoto, heroCheckCircle, heroExclamationTriangle,
    heroPlus, heroTrash, heroBriefcase, heroMapPin,
    heroPhone, heroEnvelope, heroPencilSquare
  })],
  templateUrl: './provider-profile-edit.html',
  styleUrls: ['./provider-profile-edit.css'],
})
export class ProviderProfileEditComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private profileService = inject(ProfileService);

  providerId   = '';
  providerData: ProviderProfile | null = null;
  providerForm!: FormGroup;

  // ✅ Empieza en false → el formulario se muestra de inmediato
  // Los campos se rellenan solos cuando llega la respuesta del backend
  isLoading    = false;
  isSubmitting = false;
  imagePreview: string | null = null;
  selectedFileError = '';
  statusMessage: { text: string; type: 'success' | 'error' | null } = { text: '', type: null };

  ngOnInit(): void {
    this.providerId = this.route.snapshot.paramMap.get('id') ?? '1';
    this.initForm();
    this.loadProvider();
  }

  // ── Formulario ────────────────────────────────────────────────
  initForm(): void {
    this.providerForm = this.fb.group({
      userName:             ['', [Validators.required, Validators.minLength(2)]],
      lastName:             ['', [Validators.required, Validators.minLength(2)]],
      email:                ['', [Validators.required, Validators.email]],
      phone:                ['', [Validators.pattern(/^[0-9]{4}-[0-9]{4}$/)]],
      zone:                 [''],
      bio:                  [''],
      experienceYears:      [0, [Validators.required, Validators.min(0)]],
      experienceDescription:['', [Validators.required, Validators.minLength(10)]],
      insuranceActive:      [false],
      profileImage:         [''],
    });
  }

  // ── Carga datos y rellena el form cuando llegan ───────────────
  loadProvider(): void {
    this.profileService.getProviderProfile(this.providerId).subscribe({
      next: (provider: ProviderProfile) => {
        this.providerData = provider;
        this.imagePreview = provider.profileImage ?? null;

        const parts    = (provider.fullName ?? '').split(' ');
        const userName = parts[0] ?? '';
        const lastName = parts.slice(1).join(' ');

        this.providerForm.patchValue({
          userName,
          lastName,
          email:                provider.email,
          phone:                provider.phone,
          zone:                 provider.zone,
          bio:                  provider.bio,
          experienceYears:      provider.experienceYears,
          experienceDescription:provider.experienceDescription,
          insuranceActive:      provider.insuranceActive ?? false,
          profileImage:         provider.profileImage ?? '',
        });
      },
      error: (err: unknown) => {
        console.error('Error cargando proveedor:', err);
        this.showStatus('No se pudo cargar el perfil del proveedor.', 'error');
      }
    });
  }

  // ── Guardar ───────────────────────────────────────────────────
  handleSave(): void {
    this.statusMessage = { text: '', type: null };

    if (this.providerForm.invalid) {
      this.providerForm.markAllAsTouched();
      this.showStatus('Por favor corrige los campos marcados antes de guardar.', 'error');
      return;
    }

    this.isSubmitting = true;
    const v = this.providerForm.getRawValue();

    const payload: ProviderProfileUpdateDTO = {
      userName:             v.userName,
      lastName:             v.lastName,
      email:                v.email,
      phone:                v.phone,
      zone:                 v.zone,
      bio:                  v.bio,
      experienceYears:      Number(v.experienceYears),
      experienceDescription:v.experienceDescription,
      insuranceActive:      v.insuranceActive,
      profileImage:         this.imagePreview ?? undefined,
      providerState:        this.providerData?.providerState,
    };

    this.profileService.updateProviderProfile(this.providerId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showStatus('Perfil actualizado correctamente.', 'success');
        setTimeout(() => this.router.navigate(['/provider-profile', this.providerId]), 900);
      },
      error: (err: unknown) => {
        console.error('Error actualizando proveedor:', err);
        this.isSubmitting = false;
        this.showStatus('Ocurrió un error al guardar los cambios.', 'error');
      }
    });
  }

  // ── Imagen ────────────────────────────────────────────────────
  handleImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      this.selectedFileError = 'Formato no permitido. Usa JPG, PNG o WEBP.';
      return;
    }
    if (file.size > maxSize) {
      this.selectedFileError = 'La imagen supera el tamaño máximo de 5MB.';
      return;
    }

    this.selectedFileError = '';
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.providerForm.patchValue({ profileImage: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.imagePreview = null;
    this.providerForm.patchValue({ profileImage: '' });
    this.selectedFileError = '';
  }

  // ── Navegación ────────────────────────────────────────────────
  handleCancel(): void {
    this.router.navigate(['/provider-profile', this.providerId]);
  }

  // ── Helpers ───────────────────────────────────────────────────
  private showStatus(text: string, type: 'success' | 'error'): void {
    this.statusMessage = { text, type };
    setTimeout(() => this.statusMessage = { text: '', type: null }, 4000);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.providerForm.get(fieldName);
    if (!field?.touched || !field.errors) return null;
    if (field.errors['required'])  return 'Este campo es obligatorio.';
    if (field.errors['email'])     return 'Ingresa un correo válido.';
    if (field.errors['pattern'])   return 'Formato requerido: 8888-7777.';
    if (field.errors['minlength'])
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres.`;
    if (field.errors['min'])
      return `El valor mínimo es ${field.errors['min'].min}.`;
    return 'Campo inválido.';
  }

  isInvalid(field: string): boolean {
    const c = this.providerForm.get(field);
    return !!(c?.invalid && c.touched);
  }

  get reviews() {
    return this.providerData?.reviewsList ?? [];
  }
}