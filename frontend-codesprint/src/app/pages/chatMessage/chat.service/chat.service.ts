import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessageDTO {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderName: string;
  senderAvatarUrl: string;
  content: string;
  sentAt: string;
}

export interface SendMessageRequest {
  conversationId: number;
  senderUserId: number;
  content: string;
}

export interface ConversationDTO {
  id: number;
  clientUserId: number;
  providerUserId: number;
  providerName: string;
  providerAvatar: string;
  clientName: string;
  clientAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number; // ← nuevo
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private client!: Client;
  private messageSubject = new Subject<ChatMessageDTO>();

  private readonly baseUrl = 'http://localhost:8081/api/v1';
  private readonly wsUrl   = 'http://localhost:8081/api/v1/chat';

  constructor(private http: HttpClient) {}

  getConversations(userId: number): Observable<ConversationDTO[]> {
    return this.http.get<ConversationDTO[]>(
      `${this.baseUrl}/chat/conversations/user/${userId}`
    );
  }

  searchUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/chat/search/user`,
      { params: { email } }
    );
  }

  deleteConversation(conversationId: number, userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/chat/conversation/${conversationId}`,
      { params: { userId: userId.toString() } }
    );
  }

  markAsRead(conversationId: number, userId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/chat/conversation/${conversationId}/read`,
      null,
      { params: { userId: userId.toString() } }
    );
  }

  getOrCreateDirectConversation(clientUserId: number, providerUserId: number): Observable<number> {
    return this.http.post<{ conversationId: number }>(
      `${this.baseUrl}/chat/conversation/direct`,
      null,
      { params: {
          clientUserId:   clientUserId.toString(),
          providerUserId: providerUserId.toString()
      }}
    ).pipe(map(res => res.conversationId));
  }

  loadHistory(conversationId: number): Observable<ChatMessageDTO[]> {
    return this.http.get<ChatMessageDTO[]>(
      `${this.baseUrl}/chat/conversation/${conversationId}/messages`
    );
  }

  connect(conversationId: number, onConnected?: () => void): Observable<ChatMessageDTO> {
    this.messageSubject = new Subject<ChatMessageDTO>();

    if (this.client?.active) {
      this.client.deactivate();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WS] Conectado ✓, conversación:', conversationId);
        onConnected?.();
        this.client.subscribe(
          `/topic/conversation/${conversationId}`,
          (msg: IMessage) => {
            this.messageSubject.next(JSON.parse(msg.body));
          }
        );
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message']);
      },
      onDisconnect: () => {
        console.log('[WS] Desconectado');
      }
    });

    this.client.activate();
    return this.messageSubject.asObservable();
  }

  sendMessage(req: SendMessageRequest): void {
    if (!this.client?.active) {
      console.error('[WS] Cliente no activo, mensaje no enviado');
      return;
    }
    this.client.publish({
      destination: '/app/sendMessage',
      body: JSON.stringify(req),
    });
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}