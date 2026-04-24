import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/telemedicina/notification-service';

/**
 * Interceptor HTTP global.
 *
 * Usa tu AuthService existente para:
 * 1. Obtener el token con getToken() (key: 'auth_token')
 * 2. Cerrar sesión con logout() si el token expiró
 *
 * ── Registro ──
 * En tu app.module.ts o app.config.ts:
 *
 *   providers: [
 *     { provide: HTTP_INTERCEPTORS, useClass: TelemedInterceptor, multi: true }
 *   ]
 *
 * O si ya tenés otro interceptor, podés agregar la lógica
 * del token ahí mismo sin usar este archivo.
 */
@Injectable()
export class TelemedInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // ─── 1. Agregar token usando tu AuthService ───
    const token = this.authService.getToken();

    let authRequest = request;
    if (token) {
      authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // ─── 2. Enviar request y manejar errores ───
    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleHttpError(error);
        return throwError(() => error);
      })
    );
  }

  private handleHttpError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 0:
        this.notification.showError(
          'No se pudo conectar con el servidor. Verificá tu conexión a internet.'
        );
        break;

      case 401:
        this.notification.showError('Sesión expirada. Iniciá sesión de nuevo.');
        // Usar tu AuthService.logout() que limpia todo el localStorage
        this.authService.logout();
        break;

      case 403:
        this.notification.showError(
          'No tenés permisos para realizar esta acción.'
        );
        break;

      case 404:
        // No mostrar notificación global para 404
        break;

      case 500:
        this.notification.showError(
          'Error interno del servidor. Intentá de nuevo.'
        );
        break;

      default:
        if (error.status >= 400) {
          const backendMessage =
            error.error?.message || error.error?.error || 'Error inesperado';
          this.notification.showError(backendMessage);
        }
        break;
    }
  }
}