import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profile';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../components/navbar/navbar';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './profile-edit.html'
})
export class ProfileEdit implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;
  isPasswordSectionOpen = false; // Estado para el acordeón de seguridad
  showPassword = { current: false, new: false, confirm: false };

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private profileService: ProfileService
  ) {
    // Inicialización del formulario con todos los campos del React original
    this.profileForm = this.fb.group({
      fullName: ['Rosa María González', Validators.required],
      age: ['78'],
      gender: ['Femenino'],
      phone: ['8888-7777', [Validators.required, Validators.pattern('^[0-9]{4}-[0-9]{4}$')]],
      address: ['Residencial Los Álamos, Escazú, San José'],
      emergencyName: ['María González (Hija)', Validators.required],
      emergencyEmail: ['maria.gonzalez@email.com', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {}

  togglePasswordSection() {
    this.isPasswordSectionOpen = !this.isPasswordSectionOpen;
  }

  toggleShowPassword(field: 'current' | 'new' | 'confirm') {
    this.showPassword[field] = !this.showPassword[field];
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      console.log('Enviando datos:', this.profileForm.value);
      // Aquí iría tu llamada al servicio
      // this.profileService.updateProfile(this.profileForm.value)...
    } else {
      this.profileForm.markAllAsTouched(); // Para mostrar errores si el usuario intentó enviar
    }
  }

  onCancel(): void {
    this.router.navigate(['/perfil-cliente']);
  }
}