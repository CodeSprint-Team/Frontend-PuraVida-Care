import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Tipos de notificación visual.
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  duration: number; // ms
}

/**
 * Servicio de notificaciones tipo toast/snackbar.
 *
 * Uso desde cualquier componente o servicio:
 *   this.notification.showSuccess('Consentimiento registrado');
 *   this.notification.showError('Error al conectar');
 *   this.notification.showWarning('Conexión inestable');
 *   this.notification.showInfo('Modo solo audio activado');
 *
 * El componente NotificationContainerComponent (abajo) se suscribe
 * a las notificaciones y las muestra en pantalla.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private counter = 0;
  private notificationsSubject = new Subject<AppNotification>();
  private dismissSubject = new Subject<number>();

  notifications$: Observable<AppNotification> =
    this.notificationsSubject.asObservable();
  dismiss$: Observable<number> = this.dismissSubject.asObservable();

  showSuccess(message: string, duration = 3000): void {
    this.show('success', message, duration);
  }

  showError(message: string, duration = 5000): void {
    this.show('error', message, duration);
  }

  showWarning(message: string, duration = 4000): void {
    this.show('warning', message, duration);
  }

  showInfo(message: string, duration = 3000): void {
    this.show('info', message, duration);
  }

  dismiss(id: number): void {
    this.dismissSubject.next(id);
  }

  private show(
    type: NotificationType,
    message: string,
    duration: number
  ): void {
    this.notificationsSubject.next({
      id: ++this.counter,
      type,
      message,
      duration,
    });
  }
}