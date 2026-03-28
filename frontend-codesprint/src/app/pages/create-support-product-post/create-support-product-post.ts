import { CommonModule } from '@angular/common';
import { Component, inject, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SupportProductService } from '../../services/support-product/support-product';
import { SupportProductPostRequest } from '../../interfaces/support-product/support-product.interface';
import * as L from 'leaflet';

@Component({
  selector: 'app-create-support-product-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-support-product-post.html',
  styleUrl: './create-support-product-post.css',
})
export class CreateSupportProductPostComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly supportProductService = inject(SupportProductService);
  private readonly router = inject(Router);

  map!: L.Map;
  marker!: L.Marker;
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedImage: File | null = null;
  selectedImageName = '';
  isNewCondition = false;
  imagePreview: string | null = null;

  categories = [
    { id: 1, name: 'Movilidad' },
    { id: 2, name: 'Ayuda para el hogar' },
    { id: 3, name: 'Salud y monitoreo' },
    { id: 4, name: 'Rehabilitación' },
    { id: 5, name: 'Cuidado personal' },
    { id: 6, name: 'Tecnología asistiva' },
    { id: 7, name: 'Ortopedia' },
    { id: 8, name: 'Otros' }
  ];

  postForm = this.fb.group({
    supportProductCatalogId: [null as number | null, [Validators.required]],
    userId: [null as number | null, [Validators.required]],
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required]],
    condition: ['', [Validators.required]],
    salePrice: [null as number | null, [Validators.required, Validators.min(1)]],
    originalPrice: [null as number | null, [Validators.required, Validators.min(1)]],
    acceptsOffers: [false],
    locationLat: [null as number | null, [Validators.required]],
    locationLng: [null as number | null, [Validators.required]],
    locationText: [''],
    usageTimeText: ['']
  });

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.postForm.patchValue({ userId: Number(userId) });
    }

    this.postForm.get('condition')?.valueChanges.subscribe((value) => {
      const usageTimeControl = this.postForm.get('usageTimeText');

      if (value === 'NEW') {
        this.isNewCondition = true;
        usageTimeControl?.setValue('0');
        usageTimeControl?.disable();
      } else {
        this.isNewCondition = false;
        usageTimeControl?.enable();

        if (usageTimeControl?.value === '0') {
          usageTimeControl?.setValue('');
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([9.9281, -84.0907], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      this.postForm.patchValue({
        locationLat: lat,
        locationLng: lng
      });

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }

    if (this.map) {
      this.map.remove();
    }
  }

  setAcceptsOffers(value: boolean): void {
    this.postForm.patchValue({ acceptsOffers: value });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.removeImage();
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'El archivo seleccionado no es una imagen válida.';
      this.removeImage();
      input.value = '';
      return;
    }

    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.errorMessage = '';
    this.selectedImage = file;
    this.selectedImageName = file.name;
    this.imagePreview = URL.createObjectURL(file);

    input.value = '';
  }

  removeImage(): void {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.selectedImage = null;
    this.selectedImageName = '';
    this.imagePreview = null;
  }

  submit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.postForm.getRawValue();

    const postData: SupportProductPostRequest = {
      supportProductCatalogId: Number(formValue.supportProductCatalogId),
      userId: Number(formValue.userId),
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      condition: formValue.condition ?? '',
      salePrice: Number(formValue.salePrice),
      originalPrice:
        formValue.originalPrice !== null && formValue.originalPrice !== undefined
          ? Number(formValue.originalPrice)
          : undefined,
      acceptsOffers: !!formValue.acceptsOffers,
      locationLat: Number(formValue.locationLat),
      locationLng: Number(formValue.locationLng),
      locationText: formValue.locationText ?? '',
      usageTimeText: formValue.usageTimeText ?? ''
    };

    const formData = new FormData();
    formData.append('supportProductCatalogId', String(postData.supportProductCatalogId));
    formData.append('userId', String(postData.userId));
    formData.append('title', postData.title);
    formData.append('description', postData.description);
    formData.append('condition', postData.condition);
    formData.append('salePrice', String(postData.salePrice));

    if (postData.originalPrice !== undefined) {
      formData.append('originalPrice', String(postData.originalPrice));
    }

    formData.append('acceptsOffers', String(postData.acceptsOffers));
    formData.append('locationLat', String(postData.locationLat));
    formData.append('locationLng', String(postData.locationLng));
    formData.append('locationText', postData.locationText ?? '');
    formData.append('usageTimeText', postData.usageTimeText ?? '');

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

   this.supportProductService.createPost(formData).subscribe({
  next: (response) => {
    this.loading = false;
    this.successMessage = response.message || 'Publicación creada correctamente.';

    this.postForm.reset({
      supportProductCatalogId: null,
      userId: localStorage.getItem('user_id') ? Number(localStorage.getItem('user_id')) : null,
      title: '',
      description: '',
      condition: '',
      salePrice: null,
      originalPrice: null,
      acceptsOffers: false,
      locationLat: null,
      locationLng: null,
      locationText: '',
      usageTimeText: ''
    });

    this.isNewCondition = false;

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.removeImage();

    setTimeout(() => {
      this.router.navigate(['/support-products']);
    }, 1500);
  },
  error: (error) => {
    this.loading = false;
    this.errorMessage =
      error?.error?.message || 'Ocurrió un error al crear la publicación.';
    console.error(error);
  }
});
  }

  campoInvalido(nombre: string): boolean {
    const control = this.postForm.get(nombre);
    return !!control && control.touched && control.invalid;
  }
}