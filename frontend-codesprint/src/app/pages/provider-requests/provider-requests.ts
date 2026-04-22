import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { AdminService, ProviderPending } from '../../services/admin';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroUser, heroCheckCircle, heroXCircle,
  heroClock, heroMapPin, heroPhone, heroEnvelope, heroBriefcase,
  heroDocument, heroArrowDownTray, heroChatBubbleOvalLeft
} from '@ng-icons/heroicons/outline';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-provider-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroUser, heroCheckCircle, heroXCircle,
    heroClock, heroMapPin, heroPhone, heroEnvelope, heroBriefcase,
    heroDocument, heroArrowDownTray, heroChatBubbleOvalLeft
  })],
  templateUrl: './provider-requests.html',
  styleUrl: './provider-requests.css'
})
export class ProviderRequests implements OnInit {
  role: 'admin' | 'provider' = 'admin';
  providers: ProviderPending[] = [];
  selectedProvider: ProviderPending | null = null;

  showApproveModal = false;
  showRejectModal = false;
  showInfoModal = false;

  rejectionReason = '';
  infoRequest = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.adminService.getPendingProviders().subscribe({
      next: (data) => {
        this.providers = [...data];
        this.selectedProvider = data.length > 0 ? data[0] : null;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('ERROR:', err)
    });
  }

  selectProvider(provider: ProviderPending): void {
    this.selectedProvider = provider;
    this.cdr.detectChanges();
  }

  getCategories(provider: ProviderPending): string[] {
    if (provider.categories && provider.categories.length > 0) {
      return provider.categories;
    }
    return provider.providerType ? [provider.providerType] : [];
  }

  // ── Approve
  openApproveModal(): void {
    this.showApproveModal = true;
  }

  confirmApprove(): void {
    if (!this.selectedProvider) return;
    this.adminService.reviewProvider(this.selectedProvider.providerProfileId, { action: 'approve' })
      .subscribe({
        next: () => {
          this.showApproveModal = false;
          Swal.fire({
            icon: 'success',
            title: '¡Proveedor aprobado!',
            text: `${this.selectedProvider?.fullName} ha sido aprobado exitosamente.`,
            confirmButtonColor: '#009689',
            timer: 2500,
            timerProgressBar: true
          });
          this.loadProviders();
        },
        error: (err) => {
          console.error('Error al aprobar:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo aprobar el proveedor. Intenta de nuevo.',
            confirmButtonColor: '#009689'
          });
        }
      });
  }

  // ── Reject
  openRejectModal(): void {
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.selectedProvider) return;
    this.adminService.reviewProvider(this.selectedProvider.providerProfileId, {
      action: 'reject',
      rejectionReason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.showRejectModal = false;
        Swal.fire({
          icon: 'success',
          title: 'Proveedor rechazado',
          text: `${this.selectedProvider?.fullName} ha sido rechazado.`,
          confirmButtonColor: '#009689',
          timer: 2500,
          timerProgressBar: true
        });
        this.loadProviders();
      },
      error: (err) => {
        console.error('Error al rechazar:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo rechazar el proveedor. Intenta de nuevo.',
          confirmButtonColor: '#009689'
        });
      }
    });
  }

  // ── Request info
  openInfoModal(): void {
    this.infoRequest = '';
    this.showInfoModal = true;
  }

  confirmRequestInfo(): void {
    if (!this.selectedProvider || !this.infoRequest.trim()) return;

    this.adminService.requestProviderInfo(
      this.selectedProvider.providerProfileId,
      this.infoRequest
    ).subscribe({
      next: () => {
        this.showInfoModal = false;
        this.infoRequest = '';
        Swal.fire({
          icon: 'success',
          title: 'Mensaje enviado',
          text: `Se envió la solicitud de información a ${this.selectedProvider?.fullName}.`,
          confirmButtonColor: '#009689',
          timer: 2500,
          timerProgressBar: true
        });
      },
      error: (err) => {
        console.error('Error al enviar solicitud de info:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar el mensaje. Intenta de nuevo.',
          confirmButtonColor: '#009689'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
