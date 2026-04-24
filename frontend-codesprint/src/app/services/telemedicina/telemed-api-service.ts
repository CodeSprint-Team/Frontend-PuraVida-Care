import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ConsentRequest,
  ConsentResponse,
  EndSessionRequest,
  EndSessionResponse,
  TranscriptResponse,
  AiHealthResponse,
  JaasTokenResponse
} from '../../interfaces/telemedicina/telemed-responses.interface';


@Injectable({
  providedIn: 'root',
})
export class TelemedApiService {

  private readonly baseUrl = `${environment.apiUrl}/telemedicina-controll`;

  constructor(private http: HttpClient) {}

  // ─── PUT /telemed-sessions/{id}/consent ───
  registerConsent(
    sessionId: string,
    accepted: boolean
  ): Observable<ConsentResponse> {
    const body: ConsentRequest = { accepted };
    return this.http
      .put<ConsentResponse>(
        `${this.baseUrl}/telemed-sessions/${sessionId}/consent`,
        body
      )
      .pipe(retry(1), catchError(this.handleError));
  }

  // ─── PUT /telemed-sessions/{id}/deactivate-ai ───
  deactivateAi(sessionId: string): Observable<ConsentResponse> {
    return this.http
      .put<ConsentResponse>(
        `${this.baseUrl}/telemed-sessions/${sessionId}/deactivate-ai`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  // ─── POST /telemed-sessions/{id}/end ───
  endSession(
    sessionId: string,
    providerName: string,
    durationMinutes: number
  ): Observable<EndSessionResponse> {
    const body: EndSessionRequest = { providerName, durationMinutes };
    return this.http
      .post<EndSessionResponse>(
        `${this.baseUrl}/telemed-sessions/${sessionId}/end`,
        body
      )
      .pipe(catchError(this.handleError));
  }

  // ─── GET /telemed-sessions/{id}/transcript ───
  getTranscript(sessionId: string): Observable<TranscriptResponse> {
    return this.http
      .get<TranscriptResponse>(
        `${this.baseUrl}/telemed-sessions/${sessionId}/transcript`
      )
      .pipe(catchError(this.handleError));
  }

  // ─── GET /telemed-ai/health ───
  checkAiHealth(): Observable<AiHealthResponse> {
    return this.http
      .get<AiHealthResponse>(`${this.baseUrl}/telemed-ai/health`)
      .pipe(catchError(this.handleError));
  }

  // ─── Manejo centralizado de errores ───
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente (red, etc.)
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 0:
          errorMessage =
            'No se pudo conectar con el servidor. Verifique su conexión.';
          break;
        case 404:
          errorMessage = 'Sesión no encontrada.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('[TelemedApi]', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // ─── GET /jaas-token ───
  getJaasToken(
    sessionId: string,
    userName: string,
    userEmail: string,
    moderator: boolean
  ): Observable<JaasTokenResponse> {
    const params = new HttpParams()
      .set('sessionId', sessionId)
      .set('userName', userName)
      .set('userEmail', userEmail)
      .set('moderator', moderator.toString());

    return this.http
      .get<JaasTokenResponse>(`${this.baseUrl}/jaas-token`, { params })
      .pipe(catchError(this.handleError));
  }
}