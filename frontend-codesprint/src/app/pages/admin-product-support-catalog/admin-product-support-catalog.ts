import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SupportProductCatalogService,
  SupportProductCatalogResponse,
  SupportProductCatalogCreateRequest,
  SupportProductCatalogUpdateRequest
} from '../../services/support-product/SupportProductCatalogService';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-admin-product-support-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-product-support-catalog.html',
  styleUrls: ['./admin-product-support-catalog.css']
})
export class AdminProductSupportCatalog implements OnInit {
  role: 'admin' | 'provider' = 'admin';

  categories: SupportProductCatalogResponse[] = [];
  loading = true;
  error = '';

  // Modal state
  showModal = false;
  editingCategory: SupportProductCatalogResponse | null = null;
  saving = false;

  // Delete confirmation
  showDeleteConfirm = false;
  categoryToDelete: SupportProductCatalogResponse | null = null;
  deleting = false;

  // Form
  formData = {
    category: '',
    baseName: '',
    baseDescription: '',
    active: true
  };

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private catalogService: SupportProductCatalogService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    this.catalogService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
        this.error = 'Error al cargar las categorías. Intentá de nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get activeCount(): number {
    return this.categories.filter(c => c.active).length;
  }

  get inactiveCount(): number {
    return this.categories.filter(c => !c.active).length;
  }

  // --- Modal ---

  openCreate(): void {
    this.editingCategory = null;
    this.formData = { category: '', baseName: '', baseDescription: '', active: true };
    this.showModal = true;
  }

  openEdit(cat: SupportProductCatalogResponse): void {
    this.editingCategory = cat;
    this.formData = {
      category: cat.category,
      baseName: cat.baseName,
      baseDescription: cat.baseDescription || '',
      active: cat.active
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
  }

  saveCategory(): void {
    if (!this.formData.category.trim() || !this.formData.baseName.trim()) {
      this.displayToast('Completá los campos obligatorios.', 'error');
      return;
    }

    this.saving = true;

    if (this.editingCategory) {
      const request: SupportProductCatalogUpdateRequest = {
        category: this.formData.category,
        baseName: this.formData.baseName,
        baseDescription: this.formData.baseDescription,
        active: this.formData.active
      };

      this.catalogService.update(this.editingCategory.id, request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadCategories();
          this.displayToast('Categoría actualizada correctamente.', 'success');
        },
        error: (err) => {
          this.saving = false;
          console.error(err);
          this.displayToast('Error al actualizar la categoría.', 'error');
        }
      });
    } else {
      const request: SupportProductCatalogCreateRequest = {
        category: this.formData.category,
        baseName: this.formData.baseName,
        baseDescription: this.formData.baseDescription,
        active: this.formData.active
      };

      this.catalogService.create(request).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadCategories();
          this.displayToast('Categoría creada correctamente.', 'success');
        },
        error: (err) => {
          this.saving = false;
          console.error(err);
          this.displayToast('Error al crear la categoría.', 'error');
        }
      });
    }
  }

  // --- Toggle active ---

  toggleActive(cat: SupportProductCatalogResponse): void {
    const request: SupportProductCatalogUpdateRequest = {
      category: cat.category,
      baseName: cat.baseName,
      baseDescription: cat.baseDescription || '',
      active: !cat.active
    };

    this.catalogService.update(cat.id, request).subscribe({
      next: () => {
        this.loadCategories();
        this.displayToast(
          cat.active ? 'Categoría desactivada.' : 'Categoría activada.',
          'success'
        );
      },
      error: (err) => {
        console.error(err);
        this.displayToast('Error al cambiar el estado.', 'error');
      }
    });
  }

  // --- Delete ---

  openDeleteConfirm(cat: SupportProductCatalogResponse): void {
    this.categoryToDelete = cat;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.deleting = true;

    this.catalogService.delete(this.categoryToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.closeDeleteConfirm();
        this.loadCategories();
        this.displayToast('Categoría eliminada correctamente.', 'success');
      },
      error: (err) => {
        this.deleting = false;
        console.error(err);
        this.displayToast('Error al eliminar la categoría.', 'error');
      }
    });
  }

  // --- Toast ---

  displayToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}