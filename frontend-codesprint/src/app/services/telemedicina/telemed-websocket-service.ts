import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TranscriptionResult,
  ClinicalAnalysisResult,
  WsError,
} from '../../interfaces/telemedicina/telemed-responses.interface';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class TelemedWebsocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private sessionId: string | null = null;

  private transcriptionSubject = new Subject<TranscriptionResult>();
  private analysisSubject = new Subject<ClinicalAnalysisResult>();
  private errorSubject = new Subject<WsError>();
  private connectionSubject = new Subject<boolean>();

  transcription$: Observable<TranscriptionResult> =
    this.transcriptionSubject.asObservable();
  analysis$: Observable<ClinicalAnalysisResult> =
    this.analysisSubject.asObservable();
  error$: Observable<WsError> = this.errorSubject.asObservable();
  connected$: Observable<boolean> = this.connectionSubject.asObservable();

  connect(sessionId: string): void {
    this.sessionId = sessionId;

    // WebSocket nativo en vez de SockJS
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

    // Si environment.apiUrl = http://localhost:8080
    // esto lo convierte a ws://localhost:8080/ws
    const wsUrl = `${environment.apiUrl.replace(/^http/, 'ws')}/ws`;

    this.stompClient = new Client({
      brokerURL: wsUrl,

      reconnectDelay: 5000,

      debug: (str) => {
        if (!environment.production) {
          console.log('[STOMP]', str);
        }
      },

      onConnect: () => {
        console.log('[WebSocket] Conectado a sesión:', sessionId);
        this.connectionSubject.next(true);
        this.subscribeToTopics(sessionId);
      },

      onDisconnect: () => {
        console.log('[WebSocket] Desconectado');
        this.connectionSubject.next(false);
      },

      onStompError: (frame) => {
        console.error('[WebSocket] Error STOMP:', frame.headers['message']);
        this.errorSubject.next({
          message: frame.headers['message'] || 'Error de conexión WebSocket',
        });
        this.connectionSubject.next(false);
      },

      onWebSocketError: (event) => {
        console.error('[WebSocket] Error nativo:', event);
        this.errorSubject.next({
          message: 'No se pudo establecer la conexión WebSocket',
        });
        this.connectionSubject.next(false);
      },

      onWebSocketClose: () => {
        console.warn('[WebSocket] Conexión cerrada');
        this.connectionSubject.next(false);
      },
    });

    this.stompClient.activate();
  }

  private subscribeToTopics(sessionId: string): void {
    if (!this.stompClient?.connected) return;

    this.unsubscribeAll();

    const transSub = this.stompClient.subscribe(
      `/topic/telemed/${sessionId}/transcription`,
      (message: IMessage) => {
        try {
          console.log('[WS raw transcription]', message.body);
          const result: TranscriptionResult = JSON.parse(message.body);
          this.transcriptionSubject.next(result);
        } catch (e) {
          console.error('[WebSocket] Error parsing transcription:', e, message.body);
        }
      }
    );
    this.subscriptions.push(transSub);

    const analysisSub = this.stompClient.subscribe(
      `/topic/telemed/${sessionId}/analysis`,
      (message: IMessage) => {
        try {
          console.log('[WS raw analysis]', message.body);

          const raw = JSON.parse(message.body);

          const result: ClinicalAnalysisResult = {
            symptomsSummary: raw.symptoms_summary ?? '',
            possibleDiagnoses: raw.possible_diagnoses ?? [],
            suggestedQuestions: raw.suggested_questions ?? [],
            riskFlags: raw.risk_flags ?? [],
            recommendedTests: raw.recommended_tests ?? [],
            clinicalNotes: raw.clinical_notes ?? ''
          };

          console.log('[WS mapped analysis]', result);
          this.analysisSubject.next(result);
        } catch (e) {
          console.error('[WebSocket] Error parsing analysis:', e, message.body);
        }
      }
    );
    this.subscriptions.push(analysisSub);

    const errorSub = this.stompClient.subscribe(
      `/topic/telemed/${sessionId}/error`,
      (message: IMessage) => {
        try {
          console.log('[WS raw error]', message.body);
          const err: WsError = JSON.parse(message.body);
          this.errorSubject.next(err);
        } catch (e) {
          this.errorSubject.next({ message: message.body });
        }
      }
    );
    this.subscriptions.push(errorSub);
  }

  sendAudioChunk(audioBase64: string): void {
    if (!this.stompClient?.connected || !this.sessionId) {
      console.warn('[WebSocket] No conectado, no se puede enviar audio');
      return;
    }

    console.log('[Audio] chunk enviado, length =', audioBase64.length);

    this.stompClient.publish({
      destination: `/app/telemed/${this.sessionId}/audio`,
      body: JSON.stringify({ audioBase64 }),
    });
  }

  requestAnalysis(patientHistory: string = ''): void {
    if (!this.stompClient?.connected || !this.sessionId) {
      console.warn('[WebSocket] No conectado, no se puede solicitar análisis');
      return;
    }

    this.stompClient.publish({
      destination: `/app/telemed/${this.sessionId}/analyze`,
      body: JSON.stringify({ patientHistory }),
    });
  }

  private unsubscribeAll(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  disconnect(): void {
    this.unsubscribeAll();
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
    this.stompClient = null;
    this.sessionId = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  
}