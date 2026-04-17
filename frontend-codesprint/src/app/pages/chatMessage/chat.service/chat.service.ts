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
  providerName: string;
  providerAvatar: string;
  clientName: string;
  clientAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private client!: Client;
  private messageSubject = new Subject<ChatMessageDTO>();
  private baseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  // Trae las conversaciones del usuario
  getConversations(userId: number): Observable<ConversationDTO[]> {
    return this.http.get<ConversationDTO[]>(
      `${this.baseUrl}/api/chat/conversations/user/${userId}`
    );
  }

  // Crea o reutiliza conversación directa
  getOrCreateDirectConversation(clientUserId: number, providerUserId: number): Observable<number> {
    return this.http.post<{ conversationId: number }>(
      `${this.baseUrl}/api/chat/conversation/direct`,
      null,
      { params: { clientUserId: clientUserId.toString(), providerUserId: providerUserId.toString() } }
    ).pipe(map(res => res.conversationId));
  }

  connect(conversationId: number): Observable<ChatMessageDTO> {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${this.baseUrl}/chat`),
      reconnectDelay: 5000,
      onConnect: () => {
        this.client.subscribe(
          `/topic/conversation/${conversationId}`,
          (msg: IMessage) => {
            this.messageSubject.next(JSON.parse(msg.body));
          }
        );
      }
    });
    this.client.activate();
    return this.messageSubject.asObservable();
  }

  sendMessage(req: SendMessageRequest): void {
    this.client.publish({
      destination: '/app/sendMessage',
      body: JSON.stringify(req),
    });
  }

  loadHistory(conversationId: number): Observable<ChatMessageDTO[]> {
    return this.http.get<ChatMessageDTO[]>(
      `${this.baseUrl}/api/chat/conversation/${conversationId}/messages`
    );
  }

  disconnect(): void {
    if (this.client?.active) this.client.deactivate();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}