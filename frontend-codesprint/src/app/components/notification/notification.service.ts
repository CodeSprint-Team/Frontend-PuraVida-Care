import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);

  private add(notif: Omit<Notification, 'id'>): void {
    const id = crypto.randomUUID();
    this.notifications.update(n => [...n, { ...notif, id }]);
    setTimeout(() => this.remove(id), notif.duration);
  }

  remove(id: string): void {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }

  success(message: string, description?: string): void {
    this.add({ type: 'success', message, description, duration: 4000 });
  }

  error(message: string, description?: string): void {
    this.add({ type: 'error', message, description, duration: 6000 });
  }

  warning(message: string, description?: string): void {
    this.add({ type: 'warning', message, description, duration: 4000 });
  }

  info(message: string, description?: string): void {
    this.add({ type: 'info', message, description, duration: 4000 });
  }

  promise<T>(
    promiseFn: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ): Promise<T> {
    const id = crypto.randomUUID();
    this.notifications.update(n => [...n, {
      id,
      type: 'info',
      message: messages.loading,
      duration: 99999
    }]);

    return promiseFn
      .then((result) => {
        this.remove(id);
        this.success(messages.success);
        return result;
      })
      .catch((error) => {
        this.remove(id);
        this.error(messages.error);
        throw error;
      });
  }
}