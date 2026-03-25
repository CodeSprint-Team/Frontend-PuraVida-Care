import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BiometricVerification } from '../../services/biometric-verification';

type Step = 'upload' | 'verifying' | 'success' | 'failed';

@Component({
  selector: 'app-verificacion-biometrica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './biometric-verification.html',
})
export class VerificacionBiometricaComponent implements OnInit, OnDestroy {
  step: Step = 'upload';
  userRole = 'client';
  providerData: any = null;
  clientData: any = null;
  adultoMayorData: any = null;
  verificationScore = 0;
  verificationStatus: 'pendiente' | 'aprobado' | 'rechazado' | null = null;
  errorMessage: string | null = null;

  // Image states
  selfieFile: File | null = null;
  selfiePreview: string | null = null;
  selfieError: string | null = null;

  idFrontFile: File | null = null;
  idFrontPreview: string | null = null;
  idFrontError: string | null = null;

  idBackFile: File | null = null;
  idBackPreview: string | null = null;
  idBackError: string | null = null;

  private timers: ReturnType<typeof setTimeout>[] = [];

constructor(
  private router: Router,
  private route: ActivatedRoute,
  private biometricService: BiometricVerification,
  private cdr: ChangeDetectorRef,
  private ngZone: NgZone
) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state;
    this.providerData    = state?.['providerData']    ?? null;
    this.clientData      = state?.['clientData']      ?? null;
    this.adultoMayorData = state?.['adultoMayorData'] ?? null;
    this.userRole        = state?.['userRole']
      ?? (this.providerData ? 'provider' : this.clientData ? 'client' : 'adulto-mayor');

    if (!this.hasData) {
      this.router.navigate(['/register']);
      return;
    }
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
  }


 get hasData(): boolean {
    return !!(this.providerData || this.clientData || this.adultoMayorData);
  }
 
  get canSubmit(): boolean {
    return !!(this.selfieFile && this.idFrontFile && this.idBackFile);
  }

  get fullName(): string {
    return this.providerData?.fullName
      ?? this.clientData?.fullName
      ?? this.adultoMayorData?.fullName
      ?? '';
  }

  get hasSummaryData(): boolean {
    return true;
  }

  onFileSelected(event: Event, type: 'selfie' | 'idFront' | 'idBack'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.handleImageUpload(file, type);
    input.value = '';
  }

  private handleImageUpload(file: File, type: 'selfie' | 'idFront' | 'idBack'): void {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const msg = 'La imagen es demasiado grande. El tamaño máximo es 5MB.';
      if (type === 'selfie')  this.selfieError  = msg;
      if (type === 'idFront') this.idFrontError = msg;
      if (type === 'idBack')  this.idBackError  = msg;
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === 'selfie') {
      this.selfieFile = file; this.selfiePreview = url; this.selfieError = null;
    } else if (type === 'idFront') {
      this.idFrontFile = file; this.idFrontPreview = url; this.idFrontError = null;
    } else {
      this.idBackFile = file; this.idBackPreview = url; this.idBackError = null;
    }
  }

  removeImage(type: 'selfie' | 'idFront' | 'idBack'): void {
    if (type === 'selfie') {
      this.selfieFile = null; this.selfiePreview = null; this.selfieError = null;
    } else if (type === 'idFront') {
      this.idFrontFile = null; this.idFrontPreview = null; this.idFrontError = null;
    } else {
      this.idBackFile = null; this.idBackPreview = null; this.idBackError = null;
    }
  }

  fileSizeKb(file: File | null): string {
    return file ? `${(file.size / 1024).toFixed(1)} KB` : '';
  }

  handleSubmit(): void {
    if (!this.canSubmit) return;

    const userId = this.providerData?.id ?? this.clientData?.id ?? this.adultoMayorData?.id ?? 1;

    this.step = 'verifying';
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.biometricService
      .create(userId, this.selfieFile!, this.idFrontFile!, this.idBackFile!)
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.verificationStatus = response.verificationStatus;
            this.verificationScore = response.verificationStatus === 'aprobado' ? 98 : 45;
            this.step = response.verificationStatus === 'aprobado' ? 'success' : 'failed';
            this.cdr.detectChanges();
          });
        },
        error: (err) => {

          this.ngZone.run(() => {
            this.errorMessage = 'Ocurrió un error al procesar tu solicitud. Por favor, intentá de nuevo.';
            this.step = 'failed';
            this.cdr.detectChanges();
          });
        }
      });
  }
  

  handleRetry(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.selfieFile = null;  this.selfiePreview = null;  this.selfieError = null;
    this.idFrontFile = null; this.idFrontPreview = null; this.idFrontError = null;
    this.idBackFile = null;  this.idBackPreview = null;  this.idBackError = null;
    this.verificationStatus = null;
    this.errorMessage = null;
    this.step = 'upload';
  }

  

handleContinue(): void {
  if (this.userRole === 'provider') {
    this.router.navigate(['/provider-dashboard']).then(result => {
    }).catch(err => {
    });
  } else {
    this.router.navigate(['/home']).then(result => {
    }).catch(err => {
    });
  }
}


  navigateToClient(): void {
    this.router.navigate(["/create-profile-client"]);
  }
 
  navigateToProvider(): void {
    this.router.navigate(["/create-profile-provider"]);
  }
 
  navigateBack(): void {
    this.router.navigate(['/create-profile-client']);
  }

  navigateToAdultoMayor(): void {
    this.router.navigate(['/create-profile-adulto-mayor']);
  }
 

  dashboardLabel(): string {
    return this.userRole === 'provider' ? 'dashboard' : 'inicio';
  }

  serviceLabel(): string {
    return this.userRole === 'provider' ? 'recibir solicitudes de servicio' : 'buscar proveedores';
  }

  roleLabel(): string {
    return this.userRole === 'provider' ? 'proveedor' : 'usuario';
  }
}

