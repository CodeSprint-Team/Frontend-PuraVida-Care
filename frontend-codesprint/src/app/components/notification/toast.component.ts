import { Component, inject } from '@angular/core';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (notif of notificationService.notifications(); track notif.id) {
        <div class="toast-item" [attr.data-type]="notif.type">
          <div class="toast-icon">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              @if (notif.type === 'success') {
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6.5 10L9 12.5L13.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              }
              @if (notif.type === 'error') {
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7.5 7.5L12.5 12.5M12.5 7.5L7.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              }
              @if (notif.type === 'warning') {
                <path d="M10 3L18 17H2L10 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M10 9V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="10" cy="14.5" r="0.75" fill="currentColor"/>
              }
              @if (notif.type === 'info') {
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 9V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="10" cy="6.5" r="0.75" fill="currentColor"/>
              }
            </svg>
          </div>

          <div class="toast-body">
            <p class="toast-message">{{ notif.message }}</p>
            @if (notif.description) {
              <p class="toast-description">{{ notif.description }}</p>
            }
          </div>

          <button class="toast-close" (click)="notificationService.remove(notif.id)">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <div class="toast-progress" [attr.data-type]="notif.type"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      max-width: 22rem;
      width: 100%;
      pointer-events: none;
    }

    .toast-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 0.875rem;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid;
      pointer-events: auto;
      overflow: hidden;
      animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .toast-item[data-type="success"] {
      background: rgba(240, 253, 244, 0.85);
      border-color: rgba(13, 148, 136, 0.25);
      color: #065f46;
    }

    .toast-item[data-type="error"] {
      background: rgba(254, 242, 242, 0.85);
      border-color: rgba(239, 68, 68, 0.25);
      color: #991b1b;
    }

    .toast-item[data-type="warning"] {
      background: rgba(255, 251, 235, 0.85);
      border-color: rgba(245, 158, 11, 0.25);
      color: #92400e;
    }

    .toast-item[data-type="info"] {
      background: rgba(239, 246, 255, 0.85);
      border-color: rgba(59, 130, 246, 0.25);
      color: #1e40af;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 1.125rem;
      height: 1.125rem;
      margin-top: 0.1rem;
    }

    .toast-icon svg {
      width: 100%;
      height: 100%;
    }

    .toast-body {
      flex: 1;
      min-width: 0;
    }

    .toast-message {
      margin: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: -0.01em;
    }

    .toast-description {
      margin: 0.2rem 0 0;
      font-size: 0.75rem;
      font-weight: 400;
      opacity: 0.75;
      line-height: 1.4;
    }

    .toast-close {
      flex-shrink: 0;
      width: 1.125rem;
      height: 1.125rem;
      margin-top: 0.1rem;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      opacity: 0.4;
      color: inherit;
      transition: opacity 0.15s;
    }

    .toast-close:hover {
      opacity: 0.9;
    }

    .toast-close svg {
      width: 100%;
      height: 100%;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      width: 100%;
      animation: progress 4s linear forwards;
      border-radius: 0 0 0.875rem 0.875rem;
    }

    .toast-progress[data-type="success"] { background: rgba(13, 148, 136, 0.4); }
    .toast-progress[data-type="error"]   { background: rgba(239, 68, 68, 0.4); animation-duration: 6s; }
    .toast-progress[data-type="warning"] { background: rgba(245, 158, 11, 0.4); }
    .toast-progress[data-type="info"]    { background: rgba(59, 130, 246, 0.4); }

    @keyframes toast-in {
      from { transform: translateX(calc(100% + 1.25rem)); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }

    @keyframes progress {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}