import {
  Component, OnInit, inject,
  signal, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceService, Service, ServiceStats } from '../../services/service.service';
import { NavbarComponent } from '../../components/navbar/navbar';
import { NotificationService } from '../../components/notification/notification.service';

@Component({
  selector: 'app-myservices',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './myservices.component.html',
  styleUrls: ['./myservices.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // ← clave
})
export class MyServicesComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private notifications  = inject(NotificationService);
  private router         = inject(Router);

  // Signals en lugar de propiedades planas
  services = signal<Service[]>([]);
  stats    = signal<ServiceStats>({ total: 0, active: 0, paused: 0 });
  loading  = signal(true);
  error    = signal('');
  providerId!: number;

  // Computed — solo se recalcula cuando cambia stats()
  totalServices  = computed(() => this.stats().total);
  activeServices = computed(() => this.stats().active);
  pausedServices = computed(() => this.stats().paused);

  ngOnInit(): void {
    const profileId = localStorage.getItem('profile_id');

    if (!profileId) {
      this.error.set('No se encontró el perfil. Abre tu perfil de proveedor primero.');
      this.loading.set(false);
      this.notifications.error(
        'Perfil no encontrado',
        'Navega a tu perfil de proveedor antes de continuar'
      );
      return;
    }

    this.providerId = Number(profileId);
    this.loadServices();
    this.loadStats();
  }

  loadServices(): void {
    this.loading.set(true);
    this.error.set('');

    this.serviceService.getServicesByProvider(this.providerId).subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.error.set('No se pudieron cargar los servicios.');
        this.loading.set(false);
        this.notifications.error(
          'Error al cargar servicios',
          'Verifica tu conexión e intenta de nuevo'
        );
      }
    });
  }

  loadStats(): void {
    this.serviceService.getStats(this.providerId).subscribe({
      next: (data)  => this.stats.set(data),
      error: (err)  => console.error('Error al cargar estadísticas:', err)
    });
  }

  toggleStatus(serviceId: number): void {
    this.serviceService.toggleStatus(serviceId).subscribe({
      next: (updatedService) => {
        // Inmutable update — OnPush detecta el cambio
        this.services.update(list =>
          list.map(s => s.id === serviceId ? updatedService : s)
        );
        this.loadStats();

        const isNowActive = updatedService.publicationState === 'published';
        this.notifications.success(
          isNowActive ? 'Servicio activado' : 'Servicio pausado',
          isNowActive
            ? 'Tu servicio ya es visible para los clientes'
            : 'Tu servicio está oculto temporalmente'
        );
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.notifications.error(
          'Error al cambiar estado',
          'No se pudo actualizar el servicio'
        );
      }
    });
  }

  onEdit(serviceId: number): void {
    this.router.navigate(['/edit-service', serviceId]);
  }

  onView(serviceId: number): void {
    this.router.navigate(['/service-detail', serviceId]);
  }

  onCreateNew(): void {
    this.router.navigate(['/create-services']);
  }

  isActive(service: Service): boolean {
    return service.publicationState === 'published';
  }

  formatPrice(price: number, unit: string): string {
    const units: Record<string, string> = {
      PER_HOUR:    'hora',
      PER_SERVICE: 'servicio',
      PER_DAY:     'día'
    };
    return `₡${price.toLocaleString('es-CR')} / ${units[unit] ?? unit}`;
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const months = [
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  }
}