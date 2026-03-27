import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  
import { ServiceService, Service, ServiceStats } from '../../services/service.service';

@Component({
  selector: 'app-myservices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './myservices.component.html',
  styleUrls: ['./myservices.component.css']
})
export class MyServicesComponent implements OnInit {
  services: Service[] = [];
  stats: ServiceStats = { total: 0, active: 0, paused: 0 };
  loading = true;
  error = '';
  providerId = 4;

  constructor(
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router  
  ) {
    console.log('Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('ngOnInit ejecutado');
    this.loadServices();
    this.loadStats();
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getServicesByProvider(this.providerId).subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.services = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error HTTP:', err);
        this.error = 'Error al cargar servicios';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats(): void {
    this.serviceService.getStats(this.providerId).subscribe({
      next: (data) => {
        console.log('Stats recibidas:', data);
        this.stats = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar estadísticas', err)
    });
  }

  toggleStatus(serviceId: number): void {
    this.serviceService.toggleStatus(serviceId).subscribe({
      next: (updatedService) => {
        const index = this.services.findIndex(s => s.id === serviceId);
        if (index !== -1) {
          this.services[index] = updatedService;
        }
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cambiar estado', err)
    });
  }

  // 🔴 MODIFICADO: ahora redirige a edición
  onEdit(serviceId: number): void {
    console.log('Editar servicio:', serviceId);
    this.router.navigate(['/edit-service', serviceId]);
  }

  onView(serviceId: number): void { 
    console.log('Ver servicio:', serviceId); 
  }
  
  onCreateNew(): void { 
    console.log('Crear nuevo servicio');
    this.router.navigate(['/create-services']);
  }

  get totalServices(): number { return this.stats.total; }
  get activeServices(): number { return this.stats.active; }
  get pausedServices(): number { return this.stats.paused; }

  isActive(service: Service): boolean {
    return service.publicationState === 'published';
  }

  formatPrice(price: number, unit: string): string {
    return `₡${price.toLocaleString('es-CR')}/${unit}`;
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  }
}