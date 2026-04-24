import {
  Component, OnInit, inject,
  signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup,
  Validators, ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { NavbarComponent } from '../../../components/navbar/navbar';
import {
  ServiceCategoryService,
  ServiceCategoryResponse
} from '../../../services/Admin/ServiceCategoryService';
import { NotificationService } from '../../../components/notification/notification.service';

import {
  heroArrowLeft,
  heroPhoto,
  heroDocumentText,
  heroExclamationTriangle,
  heroCheckCircle
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-create-services',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgIconComponent,
    NavbarComponent
  ],
  viewProviders: [
    provideIcons({
      heroArrowLeft,
      heroPhoto,
      heroDocumentText,
      heroExclamationTriangle,
      heroCheckCircle
    })
  ],
  templateUrl: './create-services.html',
  styleUrls: ['./create-services.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateServicesComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private router          = inject(Router);
  private http            = inject(HttpClient);
  private categoryService = inject(ServiceCategoryService);
  private notifications   = inject(NotificationService);

  serviceForm!: FormGroup;

  // Signals
  submitted         = signal(false);
  loading           = signal(false);
  loadingCategories = signal(false);

  selectedPhoto: File | null = null;
  selectedDocuments: File[]  = [];

  categories: ServiceCategoryResponse[] = [];

  priceTypes = [
    { label: 'Por hora',     value: 'PER_HOUR'    },
    { label: 'Por servicio', value: 'PER_SERVICE'  },
    { label: 'Por día',      value: 'PER_DAY'      }
  ];

  zones = [
    'San José', 'Heredia', 'Alajuela',
    'Cartago', 'Guanacaste', 'Puntarenas', 'Limón'
  ];

  modalities = [
    { label: 'Presencial', value: 'PRESENCIAL' },
    { label: 'Virtual',    value: 'VIRTUAL'    },
    { label: 'Híbrido',    value: 'HIBRIDO'    }
  ];

  requirementsList = [
    { key: 'hasLicense',    label: 'Licencia al día'        },
    { key: 'hasVehicle',    label: 'Vehículo propio'        },
    { key: 'hasInsurance',  label: 'Seguro vigente'         },
    { key: 'hasExperience', label: 'Experiencia comprobable'}
  ];

  ngOnInit(): void {
    this.serviceForm = this.fb.group({
      category:    [null, Validators.required],
      title:       ['',   [Validators.required, Validators.minLength(5)]],
      price:       [null, [Validators.required, Validators.min(1)]],
      priceType:   ['PER_HOUR', Validators.required],
      description: ['',   [Validators.required, Validators.minLength(50)]],
      zone:        ['',   Validators.required],
      modality:    ['PRESENCIAL', Validators.required],
      hasLicense:   [false],
      hasVehicle:   [false],
      hasInsurance: [false],
      hasExperience:[false]
    });

    this.loadCategories();
  }

  private loadCategories(): void {
    this.loadingCategories.set(true);

    this.categoryService.getAllActive().subscribe({
      next: (data) => {
        this.categories = data;
        this.loadingCategories.set(false);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.loadingCategories.set(false);
        this.notifications.error(
          'Error al cargar categorías',
          'Recarga la página e intenta de nuevo'
        );
      }
    });
  }

  get f() {
    return this.serviceForm.controls;
  }

  getDescriptionLength(): number {
    return this.serviceForm.get('description')?.value?.length || 0;
  }

  isFormValid(): boolean {
    return this.serviceForm.valid;
  }

  onFileChange(event: Event, type: 'photo' | 'documents'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (type === 'photo') {
      this.selectedPhoto = input.files[0];
    } else {
      this.selectedDocuments = Array.from(input.files);
    }
  }

  onCancel(): void {
    this.router.navigate(['/provider-dashboard']);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.notifications.warning(
        'Formulario incompleto',
        'Completa todos los campos obligatorios'
      );
      return;
    }

    const providerProfileId = localStorage.getItem('profile_id');

    if (!providerProfileId) {
      this.notifications.error(
        'Perfil no encontrado',
        'Inicia sesión nuevamente para continuar'
      );
      return;
    }

    const selectedCategoryId = this.serviceForm.value.category;

    if (!selectedCategoryId) {
      this.notifications.warning(
        'Categoría requerida',
        'Selecciona una categoría válida'
      );
      return;
    }

    const extraDetails = `
Zona: ${this.serviceForm.value.zone}
Modalidad: ${this.serviceForm.value.modality}
Requisitos:
- Licencia al día: ${this.serviceForm.value.hasLicense ? 'Sí' : 'No'}
- Vehículo propio: ${this.serviceForm.value.hasVehicle ? 'Sí' : 'No'}
- Seguro vigente: ${this.serviceForm.value.hasInsurance ? 'Sí' : 'No'}
- Experiencia comprobable: ${this.serviceForm.value.hasExperience ? 'Sí' : 'No'}
    `.trim();

    const payload = {
      providerProfile:  { id: Number(providerProfileId) },
      serviceCategory:  { id: Number(selectedCategoryId) },
      title:            this.serviceForm.value.title.trim(),
      serviceDescription: `${this.serviceForm.value.description.trim()}\n\n${extraDetails}`,
      basePrice:        Number(this.serviceForm.value.price),
      priceMode:        this.serviceForm.value.priceType,
      publicationState: 'pending'
    };

    this.loading.set(true);

    const request$ = this.http
      .post('http://localhost:8081/api/v1/services', payload)
      .toPromise();

    this.notifications.promise(request$ as Promise<unknown>, {
      loading: 'Publicando tu servicio...',
      success: 'Servicio creado correctamente',
      error:   'No se pudo crear el servicio'
    }).then(() => {
      this.loading.set(false);
      this.router.navigate(['/my-services']);
    }).catch((error) => {
      this.loading.set(false);
      const msg =
        typeof error?.error === 'string'
          ? error.error
          : error?.error?.message || 'Error desconocido del servidor';
      this.notifications.error('Error al crear servicio', msg);
    });
  }
}