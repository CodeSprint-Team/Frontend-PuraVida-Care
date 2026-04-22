import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TelemedApiService } from '../../../services/telemedicina/telemed-api-service';
import { TelemedWebsocketService } from '../../../services/telemedicina/telemed-websocket-service';
import { JitsiService } from '../../../services/telemedicina/jitsi-service';
import { ConnectionMonitorService, ConnectionQuality } from '../../../services/telemedicina/connection-monitor-service';
import { NotificationService } from '../../../services/telemedicina/notification-service';
import { ConsentModalComponent } from '../../../components/telemedicina/consent-modal/consent-modal.component';
import { VideoControlsComponent } from '../../../components/telemedicina/video-controls/video-controls.component';
import {
  TranscriptionResult,
  EndSessionResponse,
} from '../../../interfaces/telemedicina/telemed-responses.interface';
import { environment } from '../../../../environments/environment';
import { AudioCaptureService } from '../../../services/telemedicina/audio-capture-service';

interface SimpleExplanation {
  id: number;
  term: string;
  simple: string;
}

@Component({
  selector: 'app-patient-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ConsentModalComponent, VideoControlsComponent],
  templateUrl: './patient_view_component.html',
  styleUrls: ['./patient_view_component.css'],
})
export class PatientViewComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('jitsiContainer') jitsiContainer!: ElementRef;

  // Session
  sessionId = '';
  doctorName = 'Doctor';
  doctorSpecialty = 'Medicina General';

  // UI state
  isMicOn = true;
  isCameraOn = true;
  showSubtitles = true;
  duration = 0;
  durationInterval: any;
  activeTab: 'simple' | 'resumen' = 'simple';

  // Modals
  showConsentModal = false;
  showEndCallModal = false;
  showEmergencyModal = false;
  showRatingModal = false;
  consentLoading = false;

  // AI
  aiActive = false;
  wsConnected = false;
  lastSubtitleText = '';

  // Connection
  connectionQuality: ConnectionQuality = 'good';
  showPoorConnectionBanner = false;
  jitsiReady = false;

  // Explicaciones simples
  explicaciones: SimpleExplanation[] = [];

  // Resumen
  endSessionResult: EndSessionResponse | null = null;

  // Rating
  rating = 0;
  ratingComment = '';

  // Error
  errorMessage = '';
  loading = false;
  isEndingSession = false;

constructor(
  private router: Router,
  private route: ActivatedRoute,
  private telemedApi: TelemedApiService,
  private wsService: TelemedWebsocketService,
  private jitsiService: JitsiService,
  private connectionMonitor: ConnectionMonitorService,
  private notification: NotificationService,
  private cdr: ChangeDetectorRef,
  private audioCapture: AudioCaptureService 
) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';

    if (!this.sessionId) {
      this.errorMessage = 'No se encontró el ID de sesión';
      return;
    }

    this.startDurationTimer();
    this.showConsentModal = true;
    this.startConnectionMonitoring();
  }

  ngAfterViewInit(): void {
    if (this.jitsiContainer) {
      this.initJitsiCall();
    }
  }

  private initJitsiCall(): void {
    const patientName = localStorage.getItem('user_name') || 'Paciente';

    this.jitsiService.initCall({
      roomName: `telemed-session-${this.sessionId}`,
      parentElement: this.jitsiContainer.nativeElement,
      userDisplayName: patientName,
    });

    Promise.resolve().then(() => {
      this.jitsiReady = true;
      this.cdr.detectChanges();
    });

    this.jitsiService.onParticipantLeft(() => {
      this.notification.showWarning('El doctor se desconectó temporalmente');
    });

    this.jitsiService.onCallEnded(() => {
      if (!this.isEndingSession) {
        this.notification.showInfo('La videollamada ha finalizado');
      }
    });
  }

  private startConnectionMonitoring(): void {
    this.connectionMonitor.startMonitoring(environment.apiUrl);

    this.connectionMonitor.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.connectionQuality = status.quality;
        if (status.quality === 'poor' || status.quality === 'offline') {
          this.showPoorConnectionBanner = true;
          this.notification.showWarning(status.message);
        } else {
          this.showPoorConnectionBanner = false;
        }
      });
  }

  switchToAudioOnly(): void {
    this.showPoorConnectionBanner = false;
    this.isCameraOn = false;
    this.jitsiService.toggleVideo();
    this.notification.showInfo('Continuando en modo solo audio');
  }

  private startDurationTimer(): void {
    this.durationInterval = setInterval(() => {
      this.duration++;
    }, 1000);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onConsentDecision(accepted: boolean): void {
    this.consentLoading = true;
    this.showConsentModal = false;

    this.telemedApi
      .registerConsent(this.sessionId, accepted)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.consentLoading = false;
          this.aiActive = accepted;

          if (accepted) {
            this.connectWebSocket();
            this.startAudioCapture();  // ⬅ AGREGAR
            this.notification.showSuccess('IA activada para esta consulta');
          } else {
            this.notification.showInfo('Consulta sin asistencia de IA');
          }
        },
        error: (err) => {
          this.consentLoading = false;
          this.errorMessage = 'Error al registrar consentimiento';
          console.error(err);
        },
      });
  }

    private async startAudioCapture(): Promise<void> {
    try {
      await this.audioCapture.startCapture();
    } catch (error) {
      this.errorMessage = 'No se pudo acceder al micrófono. Verifique los permisos.';
    }
  }

  private connectWebSocket(): void {
    this.wsService.connect(this.sessionId);

    this.wsService.connected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.wsConnected = connected;
      });

    this.wsService.transcription$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: TranscriptionResult) => {
        this.lastSubtitleText = result.cleanText;
      });
  }

  toggleMic(): void {
    this.isMicOn = !this.isMicOn;
    this.jitsiService.toggleAudio();
    
    // ⬅ AGREGAR: sincronizar con captura de audio IA
    if (this.isMicOn) {
      this.audioCapture.resumeCapture();
    } else {
      this.audioCapture.pauseCapture();
    }
    
    this.notification.showInfo(this.isMicOn ? 'Micrófono activado' : 'Micrófono desactivado');
  }

  toggleCamera(): void {
    this.isCameraOn = !this.isCameraOn;
    this.jitsiService.toggleVideo();
    this.notification.showInfo(this.isCameraOn ? 'Cámara activada' : 'Cámara desactivada');
  }

  toggleSubtitles(): void {
    this.showSubtitles = !this.showSubtitles;
  }

  openEndCallModal(): void {
    this.showEndCallModal = true;
  }

  confirmEndCall(): void {
    this.isEndingSession = true;
    this.showEndCallModal = false;
    this.loading = true;

    const durationMinutes = Math.ceil(this.duration / 60);

    this.telemedApi
      .endSession(this.sessionId, 'Paciente', durationMinutes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.endSessionResult = response;
          this.loading = false;
          this.activeTab = 'resumen';

          this.audioCapture.stopCapture();
          this.wsService.disconnect();
          this.jitsiService.dispose();
          this.connectionMonitor.stopMonitoring();
          clearInterval(this.durationInterval);

          // Mostrar rating después de ver el resumen
          setTimeout(() => {
            this.showRatingModal = true;
            this.cdr.detectChanges();
          }, 3000);

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[EndSession Patient] error', err);
          this.loading = false;
          
          // Si falla (porque el doctor ya cerró la sesión), ir directo al rating
          this.audioCapture.stopCapture();
          this.wsService.disconnect();
          this.jitsiService.dispose();
          clearInterval(this.durationInterval);
          this.showRatingModal = true;
          this.cdr.detectChanges();
        }
      });
  }

  cancelEndCall(): void {
    this.showEndCallModal = false;
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  submitRating(): void {
    this.showRatingModal = false;
    this.notification.showSuccess('¡Gracias por tu calificación!');
    this.navigateToProfile();
  }

  skipRating(): void {
    this.showRatingModal = false;
    this.navigateToProfile();
  }

  private navigateToProfile(): void {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role');
    if (userId && role === 'CLIENT') {
      this.router.navigate(['/family-profile', userId]);
    } else if (userId && role === 'SENIOR') {
      this.router.navigate(['/profile', userId]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  openEmergencyModal(): void {
    this.showEmergencyModal = true;
  }

  handleEmergency(type: 'emergency' | 'family'): void {
    this.showEmergencyModal = false;
    if (type === 'emergency') {
      this.notification.showWarning('Contactando servicios de emergencia...');
    } else {
      this.notification.showInfo('Alertando a familiar de confianza...');
    }
  }

  goBack(): void {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role');
    if (userId && role === 'CLIENT') {
      this.router.navigate(['/family-profile', userId]);
    } else if (userId && role === 'SENIOR') {
      this.router.navigate(['/profile', userId]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.audioCapture.stopCapture();  
    this.wsService.disconnect();
    this.jitsiService.dispose();
    this.connectionMonitor.stopMonitoring();
    clearInterval(this.durationInterval);
  }
}