import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TelemedApiService } from '../../../services/telemedicina/telemed-api-service';
import { TelemedWebsocketService } from '../../../services/telemedicina/telemed-websocket-service';
import { AudioCaptureService } from '../../../services/telemedicina/audio-capture-service';
import { JitsiService } from '../../../services/telemedicina/jitsi-service';
import { ConnectionMonitorService, ConnectionQuality } from '../../../services/telemedicina/connection-monitor-service';
import { NotificationService } from '../../../services/telemedicina/notification-service';
import { ConsentModalComponent } from '../../../components/telemedicina/consent-modal/consent-modal.component';
import { VideoControlsComponent } from '../../../components/telemedicina/video-controls/video-controls.component';
import {
  TranscriptionResult,
  ClinicalAnalysisResult,
  AiStatus,
  EndSessionResponse,
} from '../../../interfaces/telemedicina/telemed-responses.interface';
import { environment } from '../../../../environments/environment';

interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
}

interface TranscriptionEntry {
  id: number;
  text: string;
  timestamp: string;
  symptoms?: string[];
}

type ActiveTab = 'checklist' | 'notas' | 'transcripcion' | 'resumen';

@Component({
  selector: 'app-doctor-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConsentModalComponent,
    VideoControlsComponent,
  ],
  templateUrl: './doctorViewComponent.html',
  styleUrls: ['./doctorViewComponent.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorViewComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private shouldScrollTranscription = false;

  @ViewChild('jitsiContainer') jitsiContainer!: ElementRef;
  @ViewChild('transcriptionContainer') transcriptionContainer!: ElementRef;

  // ─── Session data ───
  sessionId = '';
  patientName = 'Paciente';
  patientAge = 0;
  providerName = 'Doctor';

  // ─── UI state ───
  isMicOn = true;
  isCameraOn = true;
  showSubtitles = true;
  duration = 0;
  durationInterval: any;
  activeTab: ActiveTab = 'checklist';

  tabs: { key: ActiveTab; label: string }[] = [
    { key: 'checklist', label: 'Checklist' },
    { key: 'notas', label: 'Notas' },
    { key: 'transcripcion', label: 'Transcripción' },
    { key: 'resumen', label: 'Resumen' }
  ];

  // ─── Modal states ───
  showConsentModal = false;
  showEndCallModal = false;
  showEmergencyModal = false;
  consentLoading = false;

  // ─── AI state ───
  aiActive = false;
  aiConnected = false;
  wsConnected = false;

  // ─── Connection quality ───
  connectionQuality: ConnectionQuality = 'good';
  showPoorConnectionBanner = false;

  // ─── Video call (Jitsi) ───
  jitsiReady = false;

  // ─── Transcripción en tiempo real ───
  transcriptionEntries: TranscriptionEntry[] = [];
  lastSubtitleText = '';

  // ─── Análisis clínico ───
  clinicalAnalysis: ClinicalAnalysisResult | null = null;
  analysisLoading = false;

  // ─── Checklist clínico ───
  checklist: ChecklistItem[] = [
    { id: 1, text: 'Revisar historial médico', checked: false },
    { id: 2, text: 'Evaluar síntomas actuales', checked: false },
    { id: 3, text: 'Verificar medicación activa', checked: false },
    { id: 4, text: 'Descartar alergias', checked: false },
    { id: 5, text: 'Ordenar exámenes si necesario', checked: false },
    { id: 6, text: 'Definir tratamiento', checked: false },
    { id: 7, text: 'Agendar control', checked: false },
  ];

  // ─── Notas rápidas ───
  quickNotes = '';

  // ─── Resumen post-consulta ───
  endSessionResult: EndSessionResponse | null = null;

  // ─── Loading/Error states ───
  loading = false;
  errorMessage = '';
  isEndingSession = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private telemedApi: TelemedApiService,
    private wsService: TelemedWebsocketService,
    private audioCapture: AudioCaptureService,
    private jitsiService: JitsiService,
    private connectionMonitor: ConnectionMonitorService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';

    if (!this.sessionId) {
      this.errorMessage = 'No se encontró el ID de sesión';
      this.cdr.markForCheck();
      return;
    }

    this.providerName = localStorage.getItem('user_name') || 'Doctor';

    this.startDurationTimer();
    this.checkAiHealth();

    this.showConsentModal = true;
    this.cdr.markForCheck();

    this.startConnectionMonitoring();
  }

  ngAfterViewInit(): void {
    if (this.jitsiContainer) {
      this.initJitsiCall();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollTranscription && this.transcriptionContainer) {
      this.scrollTranscriptionToBottom();
      this.shouldScrollTranscription = false;
    }
  }

  private scrollTranscriptionToBottom(): void {
    try {
      const el = this.transcriptionContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }

  private initJitsiCall(): void {
    this.jitsiService.initCall({
      roomName: `telemed-session-${this.sessionId}`,
      parentElement: this.jitsiContainer.nativeElement,
      userDisplayName: this.providerName,
    });

    Promise.resolve().then(() => {
      this.jitsiReady = true;
      this.cdr.markForCheck();
    });

    this.jitsiService.onParticipantLeft(() => {
      this.ngZone.run(() => {
        this.notification.showWarning('El paciente se desconectó de la llamada');
        this.cdr.markForCheck();
      });
    });

    this.jitsiService.onCallEnded(() => {
      this.ngZone.run(() => {
        if (!this.isEndingSession && !this.showEndCallModal) {
          this.openEndCallModal();
        }
      });
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
        this.cdr.markForCheck();
      });
  }

  switchToAudioOnly(): void {
    this.showPoorConnectionBanner = false;
    this.isCameraOn = false;
    this.jitsiService.toggleVideo();
    this.notification.showInfo('Continuando en modo solo audio');
    this.cdr.markForCheck();
  }

  private startDurationTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      this.durationInterval = setInterval(() => {
        this.duration++;
        this.cdr.detectChanges();
      }, 1000);
    });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  private checkAiHealth(): void {
    this.telemedApi
      .checkAiHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.aiConnected = response.aiAvailable;
          this.cdr.markForCheck();
        },
        error: () => {
          this.aiConnected = false;
          this.cdr.markForCheck();
        },
      });
  }

  onConsentDecision(accepted: boolean): void {
    this.consentLoading = true;
    this.showConsentModal = false;
    this.cdr.markForCheck();

    this.telemedApi
      .registerConsent(this.sessionId, accepted)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.consentLoading = false;
          this.aiActive = accepted;
          this.cdr.markForCheck();

          if (accepted) {
            this.connectWebSocket();
            this.startAudioCapture();
          }
        },
        error: (err) => {
          this.consentLoading = false;
          this.aiActive = false;
          this.errorMessage = 'Error al registrar consentimiento';
          console.error(err);
          this.cdr.markForCheck();
        },
      });
  }

  private connectWebSocket(): void {
    this.wsService.connect(this.sessionId);

    this.wsService.connected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.wsConnected = connected;
        this.cdr.markForCheck();
      });

    this.wsService.transcription$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: TranscriptionResult) => {
        this.handleNewTranscription(result);
        this.errorMessage = '';
        this.cdr.markForCheck();
      });

    this.wsService.analysis$
      .pipe(takeUntil(this.destroy$))
      .subscribe((analysis: ClinicalAnalysisResult) => {
        this.clinicalAnalysis = analysis;
        this.analysisLoading = false;
        this.errorMessage = '';
        this.activeTab = 'resumen';
        this.cdr.markForCheck();
      });

    this.wsService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((err) => {
        console.error('[WebSocket Error]', err.message);
        this.errorMessage = err.message;
        this.analysisLoading = false;
        this.cdr.markForCheck();
      });
  }

  private async startAudioCapture(): Promise<void> {
    try {
      await this.audioCapture.startCapture();
    } catch (error) {
      this.errorMessage = 'No se pudo acceder al micrófono. Verifique los permisos.';
      this.cdr.markForCheck();
    }
  }

  private handleNewTranscription(result: TranscriptionResult): void {
    const entry: TranscriptionEntry = {
      id: this.transcriptionEntries.length + 1,
      text: result.cleanText,
      timestamp: result.timestamp || new Date().toLocaleTimeString('es-CR'),
      symptoms: result.detectedSymptoms,
    };

    this.transcriptionEntries = [...this.transcriptionEntries, entry];
    this.lastSubtitleText = result.cleanText;
    this.shouldScrollTranscription = true;
  }

  toggleMic(): void {
    this.isMicOn = !this.isMicOn;
    this.jitsiService.toggleAudio();

    if (this.isMicOn) {
      this.audioCapture.resumeCapture();
    } else {
      this.audioCapture.pauseCapture();
    }
    this.notification.showInfo(
      this.isMicOn ? 'Micrófono activado' : 'Micrófono desactivado'
    );
    this.cdr.markForCheck();
  }

  toggleCamera(): void {
    this.isCameraOn = !this.isCameraOn;
    this.jitsiService.toggleVideo();
    this.notification.showInfo(
      this.isCameraOn ? 'Cámara activada' : 'Cámara desactivada'
    );
    this.cdr.markForCheck();
  }

  toggleSubtitles(): void {
    this.showSubtitles = !this.showSubtitles;
    this.cdr.markForCheck();
  }

  toggleChecklist(id: number): void {
    const item = this.checklist.find((i) => i.id === id);
    if (item) {
      item.checked = !item.checked;
      this.cdr.markForCheck();
    }
  }

  get completedCount(): number {
    return this.checklist.filter((i) => i.checked).length;
  }

  requestAnalysis(): void {
    if (!this.wsConnected) {
      this.errorMessage = 'WebSocket no conectado';
      this.cdr.markForCheck();
      return;
    }

    this.analysisLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.wsService.requestAnalysis('');

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.analysisLoading) {
            this.analysisLoading = false;
            this.errorMessage = 'El análisis tardó demasiado o no llegó al frontend.';
            this.cdr.markForCheck();
          }
        });
      }, 15000);
    });
  }

  deactivateAi(): void {
    this.telemedApi
      .deactivateAi(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.aiActive = false;
          this.audioCapture.stopCapture();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = 'Error al desactivar IA';
          console.error(err);
          this.cdr.markForCheck();
        },
      });
  }

  // ─── Finalizar consulta ───────────────────────────────────────
  confirmEndCall(): void {
    if (this.loading) return;
    this.loading = true;
    this.isEndingSession = true;
    this.cdr.markForCheck();

    const durationMinutes = Math.ceil(this.duration / 60);

    this.telemedApi
      .endSession(this.sessionId, this.providerName, durationMinutes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.audioCapture.stopCapture();
          this.wsService.disconnect();
          this.jitsiService.dispose();
          this.connectionMonitor.stopMonitoring();
          clearInterval(this.durationInterval);

          this.endSessionResult = response;
          this.showEndCallModal = false;
          this.loading = false;
          this.activeTab = 'resumen';
          this.aiActive = false;
          this.wsConnected = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[EndSession] error', err);

          // ── Limpiar recursos siempre ──
          this.audioCapture.stopCapture();
          this.wsService.disconnect();
          this.jitsiService.dispose();
          this.connectionMonitor.stopMonitoring();
          clearInterval(this.durationInterval);

          this.showEndCallModal = false;
          this.loading = false;
          this.activeTab = 'resumen';
          this.aiActive = false;
          this.wsConnected = false;

          // ── Intentar recuperar el body del error (400 incluye EndSessionResponse) ──
          if (err?.error) {
            try {
              this.endSessionResult = typeof err.error === 'string'
                ? JSON.parse(err.error)
                : err.error;
            } catch {
              this.endSessionResult = null;
            }
          }

          // Solo mostrar error si NO hubo respuesta recuperable
          if (!this.endSessionResult) {
            this.isEndingSession = false;
            this.errorMessage = 'Error al finalizar la consulta. Intenta nuevamente.';
          }

          this.cdr.markForCheck();
        },
      });
  }

  openEndCallModal(): void {
    if (this.isEndingSession) return;
    this.showEndCallModal = true;
    this.cdr.markForCheck();
  }

  cancelEndCall(): void {
    this.showEndCallModal = false;
    this.cdr.markForCheck();
  }

  openEmergencyModal(): void {
    this.showEmergencyModal = true;
    this.cdr.markForCheck();
  }

  handleEmergency(type: 'emergency' | 'family'): void {
    this.showEmergencyModal = false;
    this.cdr.markForCheck();
    alert(
      type === 'emergency'
        ? 'Contactando servicios de emergencia...'
        : 'Alertando a familiar de confianza...'
    );
  }

  goBack(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.router.navigate(['/provider-profile', userId]);
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