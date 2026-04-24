import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ConnectionQuality = 'good' | 'fair' | 'poor' | 'offline';

export interface ConnectionStatus {
  quality: ConnectionQuality;
  downlink: number; // Mbps estimado
  rtt: number; // Round-trip time en ms
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConnectionMonitorService implements OnDestroy {
  private statusSubject = new Subject<ConnectionStatus>();
  private checkInterval: any;
  private readonly CHECK_INTERVAL_MS = 10000; // Cada 10 segundos

  status$: Observable<ConnectionStatus> = this.statusSubject.asObservable();

  private currentQuality: ConnectionQuality = 'good';

  /**
   * Iniciar monitoreo de conexión.
   * Llamar al entrar a la teleconsulta.
   */
  startMonitoring(backendUrl: string): void {
    // 1. Escuchar eventos online/offline del navegador
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // 2. Verificar con Network Information API si existe
    this.checkNetworkApi();

    // 3. Ping periódico al backend
    this.checkInterval = setInterval(() => {
      this.pingBackend(backendUrl);
    }, this.CHECK_INTERVAL_MS);

    // Check inicial
    this.pingBackend(backendUrl);
  }

  /**
   * Detener monitoreo.
   * Llamar al salir de la teleconsulta.
   */
  stopMonitoring(): void {
    clearInterval(this.checkInterval);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  /**
   * Obtener calidad actual.
   */
  getQuality(): ConnectionQuality {
    return this.currentQuality;
  }

  // ─── Network Information API ───
  private checkNetworkApi(): void {
    const connection = (navigator as any).connection;
    if (!connection) return;

    connection.addEventListener('change', () => {
      const downlink = connection.downlink || 0; // Mbps
      const rtt = connection.rtt || 0; // ms

      let quality: ConnectionQuality;
      let message: string;

      if (downlink >= 2 && rtt < 200) {
        quality = 'good';
        message = 'Conexión estable';
      } else if (downlink >= 0.5 && rtt < 500) {
        quality = 'fair';
        message = 'Conexión aceptable';
      } else {
        quality = 'poor';
        message = 'Conexión inestable. Considere modo solo audio.';
      }

      this.updateStatus(quality, downlink, rtt, message);
    });
  }

  // ─── Ping al backend ───
  private async pingBackend(backendUrl: string): Promise<void> {
    if (!navigator.onLine) {
      this.updateStatus('offline', 0, 0, 'Sin conexión a internet');
      return;
    }

    const start = performance.now();

    try {
      // Usar el health endpoint de tu backend
      const response = await fetch(
        `${backendUrl}/telemedicina-controll/telemed-ai/health`,
        {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(5000), // 5s timeout
        }
      );

      const rtt = Math.round(performance.now() - start);

      if (!response.ok) {
        this.updateStatus(
          'poor',
          0,
          rtt,
          'Servidor con problemas de respuesta'
        );
        return;
      }

      let quality: ConnectionQuality;
      let message: string;

      if (rtt < 300) {
        quality = 'good';
        message = 'Conexión estable';
      } else if (rtt < 800) {
        quality = 'fair';
        message = 'Conexión aceptable pero lenta';
      } else {
        quality = 'poor';
        message = 'Conexión muy lenta. Se recomienda modo solo audio.';
      }

      this.updateStatus(quality, 0, rtt, message);
    } catch {
      const rtt = Math.round(performance.now() - start);
      this.updateStatus(
        'poor',
        0,
        rtt,
        'No se pudo contactar al servidor'
      );
    }
  }

  // ─── Handlers ───
  private handleOnline = (): void => {
    this.updateStatus('fair', 0, 0, 'Conexión restaurada');
  };

  private handleOffline = (): void => {
    this.updateStatus('offline', 0, 0, 'Sin conexión a internet');
  };

  private updateStatus(
    quality: ConnectionQuality,
    downlink: number,
    rtt: number,
    message: string
  ): void {
    // Solo emitir si cambió la calidad
    if (quality !== this.currentQuality) {
      this.currentQuality = quality;
      this.statusSubject.next({ quality, downlink, rtt, message });
    }
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}