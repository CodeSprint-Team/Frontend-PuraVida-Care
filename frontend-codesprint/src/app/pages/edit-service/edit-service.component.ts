import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceService, Service } from '../../services/service.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-edit-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgIconComponent],
  providers: [provideIcons({ heroArrowLeft })],
  templateUrl: './edit-service.component.html'
})
export class EditServiceComponent implements OnInit {
  serviceForm!: FormGroup;
  serviceId!: number;
  loading = true;
  saving = false;
  submitted = false;

  categories = [
    { id: 1, name: 'Transporte seguro' },
    { id: 2, name: 'Transporte + Acompañante' },
    { id: 3, name: 'Enfermería/Cuidador' },
    { id: 4, name: 'Telemedicina' },
    { id: 5, name: 'Compras asistidas' }
  ];

  priceTypes = [
    { value: 'hora', label: 'Por hora' },
    { value: 'viaje', label: 'Por viaje' },
    { value: 'evento', label: 'Por evento' },
    { value: 'dia', label: 'Por día' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadService();
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      categoryId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(1)]],
      priceMode: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  get f() { return this.serviceForm.controls; }

  loadService(): void {
    this.loading = true;
    this.serviceService.getServiceById(this.serviceId).subscribe({
      next: (service: Service) => {
        this.serviceForm.patchValue({
          categoryId: service.serviceCategory.id,
          title: service.title,
          price: service.basePrice,
          priceMode: service.priceMode,
          description: service.serviceDescription
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando servicio:', err);
        this.loading = false;
        alert('Error al cargar el servicio');
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.serviceForm.invalid) return;

    this.saving = true;

    const updatedData = {
      title: this.f['title'].value,
      serviceDescription: this.f['description'].value,
      basePrice: this.f['price'].value,
      priceMode: this.f['priceMode'].value,
      serviceCategory: { id: Number(this.f['categoryId'].value) }
    };

    this.serviceService.updateService(this.serviceId, updatedData).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/my-services']);
      },
      error: (err) => {
        this.saving = false;
        console.error('Error actualizando:', err);
        alert('Error al actualizar el servicio');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-services']);
  }
}