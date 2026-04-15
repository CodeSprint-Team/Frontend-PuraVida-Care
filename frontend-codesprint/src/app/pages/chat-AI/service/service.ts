import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChatConversationRequest,
  ChatConversationResponse,
  BookingDraftRequest,
  BookingDraftResponse,
  BookingConfirmResponse,
} from '../chat-model/chat-model';

@Injectable({ providedIn: 'root' })
export class ChatIAService {
  private http    = inject(HttpClient);
  private baseUrl = 'http://localhost:8081/api/v1/ai';

  // ── Conversación con IA ───────────────────────────────
  // Envía el historial completo y la IA decide:
  // - si sigue preguntando (type: 'message')
  // - si ya tiene suficiente info para recomendar (type: 'recommendation')
  chat(request: ChatConversationRequest): Observable<ChatConversationResponse> {
    return this.http.post<ChatConversationResponse>(`${this.baseUrl}/chat`, request);
  }

  // ── Borrador de reserva ───────────────────────────────
  createBookingDraft(request: BookingDraftRequest): Observable<BookingDraftResponse> {
    return this.http.post<BookingDraftResponse>(`${this.baseUrl}/booking-draft`, request);
  }

  // ── Confirmar reserva ─────────────────────────────────
  confirmBookingDraft(draftId: string): Observable<BookingConfirmResponse> {
    return this.http.post<BookingConfirmResponse>(
      `${this.baseUrl}/booking-draft/${draftId}/confirm`, {}
    );
  }
}