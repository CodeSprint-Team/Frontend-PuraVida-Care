import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import {
  NotificationService,
  AppNotification,
} from '../../../services/telemedicina/notification-service';

/**
 * Contenedor de notificaciones toast.
 *
 * Colocar UNA VEZ en el app.component.html:
 *   <app-notification-container></app-notification-container>
 *   <router-outlet></router-outlet>
 */
@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Contenedor fijo en esquina superior derecha -->
    <div class="fixed top-4 right-4 z-[9999] space-y-3 w-80 sm:w-96 pointer-events-none">
      <div
        *ngFor="let notification of activeNotifications; trackBy: trackById"
        class="pointer-events-auto rounded-xl shadow-lg border px-4 py-3 flex items-start gap-3 animate-slideIn"
        [ngClass]="getNotificationClasses(notification.type)"
      >
        <!-- Icono -->
        <div class="flex-shrink-0 mt-0.5">
          <!-- Success -->
          <svg
            *ngIf="notification.type === 'success'"
            class="h-5 w-5 text-green-600"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <!-- Error -->
          <svg
            *ngIf="notification.type === 'error'"
            class="h-5 w-5 text-red-600"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <!-- Warning -->
          <svg
            *ngIf="notification.type === 'warning'"
            class="h-5 w-5 text-amber-600"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <!-- Info -->
          <svg
            *ngIf="notification.type === 'info'"
            class="h-5 w-5 text-blue-600"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>

        <!-- Mensaje -->
        <p class="text-sm font-medium flex-1">{{ notification.message }}</p>

        <!-- Botón cerrar -->
        <button
          (click)="removeNotification(notification.id)"
          class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `],
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  activeNotifications: AppNotification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Escuchar nuevas notificaciones
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        this.activeNotifications.push(notification);

        // Auto-dismiss después del duration
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, notification.duration);
      });

    // Escuchar dismiss manual
    this.notificationService.dismiss$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.removeNotification(id);
      });
  }

  removeNotification(id: number): void {
    this.activeNotifications = this.activeNotifications.filter(
      (n) => n.id !== id
    );
  }

  getNotificationClasses(type: string): Record<string, boolean> {
    return {
      'bg-green-50 border-green-200 text-green-800': type === 'success',
      'bg-red-50 border-red-200 text-red-800': type === 'error',
      'bg-amber-50 border-amber-200 text-amber-800': type === 'warning',
      'bg-blue-50 border-blue-200 text-blue-800': type === 'info',
    };
  }

  trackById(index: number, item: AppNotification): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}