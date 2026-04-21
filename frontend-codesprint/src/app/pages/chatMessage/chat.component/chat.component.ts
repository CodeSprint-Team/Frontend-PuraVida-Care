import {
  Component, OnInit, OnDestroy, ViewChild,
  ElementRef, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroPaperAirplane } from '@ng-icons/heroicons/outline';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessageDTO, SendMessageRequest } from '../chat.service/chat.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../../components/navbar/navbar';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({ heroArrowLeft, heroPaperAirplane })]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private msgContainer!: ElementRef;

  conversationId!: number;
  currentUserId!:  number;
  messages:        ChatMessageDTO[] = [];
  newMessage     = '';
  providerName   = '';
  providerAvatar = '';
  connected      = false;
  loading        = true;

  private sub!: Subscription;
  private shouldScroll = false;

  constructor(
    private route:       ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService,
    private cdr:         ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserId  = Number(this.authService.getUserId());
    this.conversationId = Number(this.route.snapshot.paramMap.get('id'));

    const nav = history.state?.conversation;
    if (nav) {
      this.providerName   = nav.providerName;
      this.providerAvatar = nav.providerAvatar;
    }

    // Cargar historial y marcar como leído
    this.chatService.loadHistory(this.conversationId).subscribe({
      next: (history) => {
        this.messages     = history;
        this.loading      = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();

        // Marcar como leído al abrir
        this.chatService.markAsRead(this.conversationId, this.currentUserId)
          .subscribe({ error: (e) => console.error('Error markAsRead:', e) });
      },
      error: (err) => {
        console.error('[REST] Error cargando historial:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    // Conectar WebSocket
    this.sub = this.chatService.connect(
      this.conversationId,
      () => {
        this.connected = true;
        this.cdr.detectChanges();
      }
    ).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.shouldScroll = true;
        this.cdr.detectChanges();

        // Marcar como leído si el mensaje es del otro
        if (msg.senderUserId !== this.currentUserId) {
          this.chatService.markAsRead(this.conversationId, this.currentUserId)
            .subscribe({ error: (e) => console.error('Error markAsRead:', e) });
        }
      },
      error: (err) => console.error('[WS] Error:', err)
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text) return;

    const req: SendMessageRequest = {
      conversationId: this.conversationId,
      senderUserId:   this.currentUserId,
      content:        text,
    };

    this.chatService.sendMessage(req);
    this.newMessage = '';
  }

  isOwn(msg: ChatMessageDTO): boolean {
    return msg.senderUserId === this.currentUserId;
  }

  getAvatar(msg: ChatMessageDTO): string {
    if (msg.senderAvatarUrl && !msg.senderAvatarUrl.includes('pravatar.cc')) {
      return msg.senderAvatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=0d9488&color=fff`;
  }

  private scrollToBottom(): void {
    try {
      this.msgContainer.nativeElement.scrollTop =
        this.msgContainer.nativeElement.scrollHeight;
    } catch {}
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chatService.disconnect();
  }
}