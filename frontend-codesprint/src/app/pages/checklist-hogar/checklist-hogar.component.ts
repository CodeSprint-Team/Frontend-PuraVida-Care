import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FilterByCategoryPipe } from '../../pipes/filter-by-category.pipe'; 

export interface ChecklistItem {
  id: string;
  category: 'seguridad' | 'medicinas' | 'accesibilidad' | 'emergencia' | 'rutina';
  title: string;
  description: string;
  checked: boolean;
  required: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-checklist-hogar',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FilterByCategoryPipe],
  templateUrl: './checklist-hogar.component.html',
  styleUrls: ['./checklist-hogar.component.css']
})
export class ChecklistHogarComponent {
  showSuccessModal = false;

  items: ChecklistItem[] = [
    // Seguridad
    { id: 's1', category: 'seguridad', title: 'Gas cerrado o verificado', description: 'Verificar que la llave de gas esté en posición segura', checked: false, required: true },
    { id: 's2', category: 'seguridad', title: 'Puertas principales funcionan', description: 'Verificar que abren/cierran correctamente', checked: false, required: true },
    { id: 's3', category: 'seguridad', title: 'Salidas de emergencia libres', description: 'Sin obstáculos en rutas de evacuación', checked: false, required: true },
    { id: 's4', category: 'seguridad', title: 'Breaker eléctrico localizado', description: 'Saber dónde está y cómo usarlo', checked: false, required: true },
    // Medicinas
    { id: 'm1', category: 'medicinas', title: 'Pastillero listo y organizado', description: 'Verificar que tiene las dosis del día', checked: false, required: true },
    { id: 'm2', category: 'medicinas', title: 'Horarios de medicinas confirmados', description: 'Revisar 8:00am y 8:00pm (según paciente)', checked: false, required: true },
    { id: 'm3', category: 'medicinas', title: 'Medicinas de emergencia ubicadas', description: 'Saber dónde están nitroglicerina, aspirina, etc.', checked: false, required: true },
    // Accesibilidad
    { id: 'a1', category: 'accesibilidad', title: 'Zonas peligrosas identificadas', description: 'Escalones, alfombras, obstáculos marcados', checked: false, required: true },
    { id: 'a2', category: 'accesibilidad', title: 'Alfombras aseguradas', description: 'Verificar que no se deslicen', checked: false, required: false },
    { id: 'a3', category: 'accesibilidad', title: 'Iluminación adecuada', description: 'Especialmente en pasillos y baños', checked: false, required: false },
    // Emergencia
    { id: 'e1', category: 'emergencia', title: 'Contactos de emergencia a mano', description: 'Familiar principal, médico, 911', checked: false, required: true },
    { id: 'e2', category: 'emergencia', title: 'Botiquín ubicado y completo', description: 'Verificar ubicación y contenido', checked: false, required: true },
    { id: 'e3', category: 'emergencia', title: 'Extintor ubicado', description: 'Saber dónde está y cómo usarlo', checked: false, required: true },
    // Rutina
    { id: 'r1', category: 'rutina', title: 'Llaves localizadas', description: 'Saber dónde están las llaves principales', checked: false, required: true },
    { id: 'r2', category: 'rutina', title: 'Documentos importantes ubicados', description: 'Cédula, tarjeta salud, recetas', checked: false, required: true },
    { id: 'r3', category: 'rutina', title: 'Instrucciones especiales revisadas', description: 'Dieta, restricciones, preferencias', checked: false, required: false }
  ];

  categories: Category[] = [
    { id: 'seguridad', name: 'Seguridad', icon: 'fa-solid fa-shield', color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'medicinas', name: 'Medicinas', icon: 'fa-solid fa-pills', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'accesibilidad', name: 'Accesibilidad', icon: 'fa-solid fa-triangle-exclamation', color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { id: 'emergencia', name: 'Emergencia', icon: 'fa-solid fa-circle-exclamation', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'rutina', name: 'Rutina', icon: 'fa-solid fa-clock', color: 'text-teal-600', bgColor: 'bg-teal-50' }
  ];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home-filter']);
  }

  goToHomeMap(): void {
    this.router.navigate(['/home-filter']);
  }

  goToActiveService(): void {
    this.router.navigate(['/active-service']);
  }

  toggleItem(id: string): void {
    this.items = this.items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
  }

  markAsReviewed(): void {
    const requiredItems = this.items.filter(item => item.required);
    const allRequiredChecked = requiredItems.every(item => item.checked);

    if (!allRequiredChecked) {
      alert('Por favor completá todos los ítems obligatorios antes de marcar como revisado');
      return;
    }

    this.showSuccessModal = true;
  }

  getProgress(): number {
    const totalRequired = this.items.filter(item => item.required).length;
    const completedRequired = this.items.filter(item => item.required && item.checked).length;
    return Math.round((completedRequired / totalRequired) * 100);
  }

  getCategoryProgress(categoryId: string): { total: number; completed: number; percentage: number } {
    const categoryItems = this.items.filter(item => item.category === categoryId);
    const completedItems = categoryItems.filter(item => item.checked);
    return {
      total: categoryItems.length,
      completed: completedItems.length,
      percentage: categoryItems.length > 0 ? Math.round((completedItems.length / categoryItems.length) * 100) : 0
    };
  }

  getCompletedCount(): number {
    return this.items.filter(item => item.checked).length;
  }

  getRemainingRequiredCount(): number {
    return this.items.filter(item => item.required && !item.checked).length;
  }

  getCategoryBarColor(categoryId: string): string {
    const colors: { [key: string]: string } = {
      seguridad: 'bg-red-600',
      medicinas: 'bg-blue-600',
      accesibilidad: 'bg-amber-600',
      emergencia: 'bg-orange-600',
      rutina: 'bg-teal-600'
    };
    return colors[categoryId] || 'bg-gray-600';
  }
}