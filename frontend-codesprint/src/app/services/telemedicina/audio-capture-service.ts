import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { TelemedWebsocketService } from '../telemedicina/telemed-websocket-service';

@Injectable({
  providedIn: 'root',
})
export class AudioCaptureService implements OnDestroy {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private isCapturing = false;

  private readonly RECORDING_WINDOW_MS = 12000;

  private restartTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentMimeType = 'audio/webm';
  private currentChunks: Blob[] = [];

  private statusSubject = new Subject<'recording' | 'stopped' | 'error'>();
  status$: Observable<'recording' | 'stopped' | 'error'> =
    this.statusSubject.asObservable();

  constructor(private wsService: TelemedWebsocketService) {}

  async startCapture(): Promise<void> {
    try {
      if (!this.audioStream) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      this.isCapturing = true;
      this.currentMimeType = this.getSupportedMimeType() || 'audio/webm';

      this.startRecorderCycle();
      this.statusSubject.next('recording');

      console.log('[AudioCapture] Captura iniciada con mimeType:', this.currentMimeType);
    } catch (error) {
      console.error('[AudioCapture] Error al iniciar:', error);
      this.statusSubject.next('error');
      throw error;
    }
  }

  private startRecorderCycle(): void {
    if (!this.audioStream || !this.isCapturing) return;

    this.currentChunks = [];

    this.mediaRecorder = new MediaRecorder(this.audioStream, {
      mimeType: this.currentMimeType,
    });

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.currentChunks.push(event.data);
        console.log('[AudioCapture] chunk capturado:', event.data.size);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('[AudioCapture] Error en MediaRecorder', event);
      this.statusSubject.next('error');
    };

    this.mediaRecorder.onstop = async () => {
      try {
        if (this.currentChunks.length > 0) {
          const finalBlob = new Blob(this.currentChunks, {
            type: this.currentMimeType,
          });

          console.log('[AudioCapture] blob final size =', finalBlob.size);

          if (finalBlob.size > 0) {
            const base64 = await this.blobToBase64(finalBlob);
            this.wsService.sendAudioChunk(base64);
          }
        }
      } catch (error) {
        console.error('[AudioCapture] Error procesando blob final:', error);
        this.statusSubject.next('error');
      }

      if (this.isCapturing) {
        this.startRecorderCycle();
      }
    };

    this.mediaRecorder.start();

    this.restartTimeoutId = setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
    }, this.RECORDING_WINDOW_MS);
  }

  stopCapture(): void {
    this.isCapturing = false;

    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
      this.restartTimeoutId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    } else {
      this.cleanupStream();
    }

    this.statusSubject.next('stopped');
    console.log('[AudioCapture] Captura detenida');
  }

  pauseCapture(): void {
    this.isCapturing = false;

    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
      this.restartTimeoutId = null;
    }

    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  resumeCapture(): void {
    if (this.audioStream && !this.isCapturing) {
      this.isCapturing = true;
      this.startRecorderCycle();
    }
  }

  get capturing(): boolean {
    return this.isCapturing;
  }

  private cleanupStream(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    this.mediaRecorder = null;
    this.currentChunks = [];
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;

        if (!result || !result.includes(',')) {
          reject(new Error('No se pudo convertir el blob a base64'));
          return;
        }

        resolve(result.split(',')[1]);
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }

  ngOnDestroy(): void {
    this.stopCapture();
    this.cleanupStream();
  }
}