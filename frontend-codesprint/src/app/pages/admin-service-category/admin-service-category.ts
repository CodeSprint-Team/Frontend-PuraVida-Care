import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ServiceCategoryService,
  ServiceCategoryResponse,
  ServiceCategoryCreateRequest,
  ServiceCategoryUpdateRequest
} from '../../services/Admin/ServiceCategoryService';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-admin-service-category',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-service-category.html',
  styleUrls: ['./admin-service-category.css']
})
export class AdminServiceCategory implements OnInit {
  role: 'admin' | 'provider' = 'admin';

  categories: ServiceCategoryResponse[] = [];
  loading = true;
  error = '';

  // Modal state
  showModal = false;
  editingCategory: ServiceCategoryResponse | null = null;
  saving = false;

  // Delete confirmation
  showDeleteConfirm = false;
  categoryToDelete: ServiceCategoryResponse | null = null;
  deleting = false;

  // Form
  formData = {
    categoryName: '',
    categoryState: 'active'
  };

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private categoryService: ServiceCategoryService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    this.categoryService.getAll().subscribe({
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
    return this.categories.filter(c => c.categoryState === 'active').length;
  }

  get inactiveCount(): number {
    return this.categories.filter(c => c.categoryState !== 'active').length;
  }

  isActive(cat: ServiceCategoryResponse): boolean {
    return cat.categoryState === 'active';
  }

  // --- Modal ---

  openCreate(): void {
    this.editingCategory = null;
    this.formData = { categoryName: '', categoryState: 'active' };
    this.showModal = true;
  }

  openEdit(cat: ServiceCategoryResponse): void {
    this.editingCategory = cat;
    this.formData = {
      categoryName: cat.categoryName,
      categoryState: cat.categoryState
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
  }

  saveCategory(): void {
    if (!this.formData.categoryName.trim()) {
      this.displayToast('El nombre de la categoría es obligatorio.', 'error');
      return;
    }

    this.saving = true;

    if (this.editingCategory) {
      const request: ServiceCategoryUpdateRequest = {
        categoryName: this.formData.categoryName,
        categoryState: this.formData.categoryState
      };

      this.categoryService.update(this.editingCategory.id, request).subscribe({
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
      const request: ServiceCategoryCreateRequest = {
        categoryName: this.formData.categoryName,
        categoryState: this.formData.categoryState
      };

      this.categoryService.create(request).subscribe({
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

  toggleActive(cat: ServiceCategoryResponse): void {
    const newState = cat.categoryState === 'active' ? 'inactive' : 'active';

    const request: ServiceCategoryUpdateRequest = {
      categoryName: cat.categoryName,
      categoryState: newState
    };

    this.categoryService.update(cat.id, request).subscribe({
      next: () => {
        this.loadCategories();
        this.displayToast(
          newState === 'active' ? 'Categoría activada.' : 'Categoría desactivada.',
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

  openDeleteConfirm(cat: ServiceCategoryResponse): void {
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

    this.categoryService.delete(this.categoryToDelete.id).subscribe({
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