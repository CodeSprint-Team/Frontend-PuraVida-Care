import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ServiceService } from '../../../services/service.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroArrowLeft,
  heroDocumentText,
  heroCheckCircle,
  heroExclamationTriangle,
  heroPhoto
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-create-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgIconComponent],
  providers: [provideIcons({
    heroArrowLeft,
    heroDocumentText,
    heroCheckCircle,
    heroExclamationTriangle,
    heroPhoto
  })],
  templateUrl: './create-services.html'
})
export class CreateServicesComponent implements OnInit {
  serviceForm!: FormGroup;
  loading = false;
  submitted = false;
  providerId = 1;

  categories = [
    'Transporte seguro',
    'Transporte + Acompañante',
    'Enfermería/Cuidador',
    'Telemedicina',
    'Compras asistidas'
  ];

  zones = [
    'San José Centro',
    'Escazú',
    'Curridabat',
    'Heredia',
    'Alajuela',
    'Cartago',
    'Desamparados'
  ];

  priceTypes = [
    { value: 'hourly', label: 'Por hora' },
    { value: 'per-trip', label: 'Por viaje' }
  ];

  modalities = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'both', label: 'Ambas' }
  ];

  requirementsList = [
    { key: 'experience', label: 'Experiencia comprobable (mínimo 2 años)' },
    { key: 'license', label: 'Licencia profesional vigente' },
    { key: 'certification', label: 'Certificación o título académico' }
  ];

  selectedPhoto: File | null = null;
  selectedDocuments: File[] = [];

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(1)]],
      priceType: ['hourly', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]],
      zone: ['', Validators.required],
      modality: ['presencial', Validators.required],
      requirements: this.fb.group({
        experience: [false],
        license: [false],
        certification: [false]
      })
    });
  }

  get f() { return this.serviceForm.controls; }
  get requirements() { return (this.f['requirements'] as FormGroup).controls; }

  onFileChange(event: Event, type: 'photo' | 'documents'): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      if (type === 'photo') {
        this.selectedPhoto = input.files[0];
      } else {
        this.selectedDocuments = Array.from(input.files);
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.serviceForm.invalid) {
      return;
    }

    this.loading = true;

    const serviceData = {
      title: this.f['title'].value,
      serviceDescription: this.f['description'].value,
      basePrice: this.f['price'].value,
      priceMode: this.f['priceType'].value === 'hourly' ? 'hora' : 'viaje',
      providerProfile: { id: this.providerId },
      serviceCategory: { 
        id: this.getCategoryId(this.f['category'].value) 
      },
      zone: this.f['zone'].value,
      modality: this.f['modality'].value,
      requirements: this.f['requirements'].value
    };

    this.serviceService.createService(serviceData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/my-services']);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error al crear servicio:', error);
        alert('Error al crear el servicio. Intenta de nuevo.');
      }
    });
  }

  getCategoryId(categoryName: string): number {
    const categoryMap: { [key: string]: number } = {
      'Transporte seguro': 1,
      'Transporte + Acompañante': 2,
      'Enfermería/Cuidador': 3,
      'Telemedicina': 4,
      'Compras asistidas': 5
    };
    return categoryMap[categoryName] || 1;
  }

  onCancel(): void {
    this.router.navigate(['/my-services']);
  }

  isFormValid(): boolean {
    return this.serviceForm.valid;
  }

  getDescriptionLength(): number {
    return this.f['description']?.value?.length || 0;
  }
}