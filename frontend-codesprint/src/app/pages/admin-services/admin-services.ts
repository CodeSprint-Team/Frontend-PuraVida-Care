import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroClock,
  heroCheckCircle,
  heroXCircle,
  heroClipboardDocument,
  heroInformationCircle
} from '@ng-icons/heroicons/outline';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AdminService, CareServicePending } from '../../services/admin';
import {NavbarComponent} from '../../components/navbar/navbar';


export type ServiceModerationState = 'pending' | 'published' | 'rejected';

interface FilterTab {
  label: string;
  value: ServiceModerationState | 'all';
}

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft,
    heroClock,
    heroCheckCircle,
    heroXCircle,
    heroClipboardDocument,
    heroInformationCircle
  })],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.css'
})
export class AdminServices implements OnInit {

  role: 'admin' | 'provider' = 'admin';
  services: CareServicePending[] = [];
  selectedService: CareServicePending | null = null;

  // Flujo de rechazo
  showRejectionInput = false;
  rejectionReason = '';
  rejectionError = false;

  // Filtro activo
  activeFilter: ServiceModerationState | 'all' = 'pending';

  tabs: FilterTab[] = [
    { label: 'Pendientes', value: 'pending'   },
    { label: 'Aprobados',  value: 'published' },
    { label: 'Rechazados', value: 'rejected'  },
    { label: 'Todos',      value: 'all'       },
  ];


  get filteredServices(): CareServicePending[] {
    if (this.activeFilter === 'all') return this.services;
    return this.services.filter(s => s.publicationState === this.activeFilter);
  }

  get pendingCount():   number { return this.services.filter(s => s.publicationState === 'pending').length;   }
  get approvedCount():  number { return this.services.filter(s => s.publicationState === 'published').length; }
  get rejectedCount():  number { return this.services.filter(s => s.publicationState === 'rejected').length;  }

  getCountByState(state: ServiceModerationState | 'all'): number {
    if (state === 'all') return this.services.length;
    return this.services.filter(s => s.publicationState === state).length;
  }

  stateLabel(state: string): string {
    const map: Record<string, string> = {
      pending:   'Pendiente',
      published: 'Aprobado',
      rejected:  'Rechazado'
    };
    return map[state] ?? state;
  }

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }


  loadServices(selectId?: number): void {
    this.adminService.getAllCareServices().subscribe({  
      next: (data) => {
        this.services = [...data];
        if (selectId) {
          this.selectedService = data.find(s => s.careServiceId === selectId) ?? data[0] ?? null;
        } else {
          this.selectedService = data.find(s => s.publicationState === 'pending') ?? data[0] ?? null;
        }
        this.resetRejectionForm();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando servicios:', err)
    });
  }


  selectService(service: CareServicePending): void {
    this.selectedService = service;
    this.resetRejectionForm();
    this.cdr.detectChanges();
  }

  // ── Filtro

  setFilter(filter: ServiceModerationState | 'all'): void {
    this.activeFilter = filter;
    this.selectedService = this.filteredServices[0] ?? null;
    this.resetRejectionForm();
    this.cdr.detectChanges();
  }

  // ── Aprobar

  approveService(): void {
    if (!this.selectedService) return;

    Swal.fire({
      title: '¿Aprobar servicio?',
      text: `"${this.selectedService.title}" quedará activo y visible para los usuarios.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed || !this.selectedService) return;
      const id = this.selectedService.careServiceId;

      this.adminService.reviewCareService(id, { action: 'approve' }).subscribe({
        next: () => {
          Swal.fire({ title: '¡Aprobado!', text: 'El servicio ya está activo y visible.', icon: 'success', timer: 2000, showConfirmButton: false });
          this.loadServices(id);
        },
        error: () => Swal.fire('Error', 'No se pudo aprobar el servicio.', 'error')
      });
    });
  }

  // ── Rechazar

  confirmReject(): void {
    if (!this.selectedService) return;

    if (!this.rejectionReason.trim()) {
      this.rejectionError = true;
      return;
    }

    this.rejectionError = false;
    const reason = this.rejectionReason.trim();
    const id = this.selectedService.careServiceId;

    Swal.fire({
      title: '¿Rechazar servicio?',
      text: 'Se notificará al proveedor con el motivo indicado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.adminService.reviewCareService(id, { action: 'reject', rejectionReason: reason }).subscribe({
        next: () => {
          this.resetRejectionForm();
          Swal.fire({ title: '¡Rechazado!', text: 'El proveedor será notificado.', icon: 'success', timer: 2000, showConfirmButton: false });
          this.loadServices(id);
        },
        error: () => Swal.fire('Error', 'No se pudo rechazar el servicio.', 'error')
      });
    });
  }

  cancelRejection(): void {
    this.resetRejectionForm();
  }


  private resetRejectionForm(): void {
    this.showRejectionInput = false;
    this.rejectionReason = '';
    this.rejectionError = false;
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
