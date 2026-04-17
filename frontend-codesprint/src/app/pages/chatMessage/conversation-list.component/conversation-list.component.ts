import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroChatBubbleLeftRight } from '@ng-icons/heroicons/outline';
import { ChatService, ConversationDTO } from '../chat.service/chat.service';

@Component({
  selector: 'app-conversation-list',
  templateUrl: './conversation-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({ heroMagnifyingGlass, heroChatBubbleLeftRight })
  ]
})
export class ConversationListComponent implements OnInit {
  conversations: ConversationDTO[] = [];
  searchQuery = '';
  loading = true;
  errorMessage = '';

  // TODO: reemplazar con AuthService cuando esté listo
  private currentUserId = 1;

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getConversations(this.currentUserId).subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las conversaciones.';
        this.loading = false;
      }
    });
  }

  get filtered(): ConversationDTO[] {
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c =>
      c.providerName?.toLowerCase().includes(q) ||
      c.clientName?.toLowerCase().includes(q)
    );
  }

  getOtherName(conv: ConversationDTO): string {
    return conv.providerName ?? conv.clientName ?? 'Usuario';
  }

  getOtherAvatar(conv: ConversationDTO): string {
    return conv.providerAvatar ?? conv.clientAvatar ?? 'https://i.pravatar.cc/150';
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit' });
  }

  openChat(conv: ConversationDTO): void {
    this.router.navigate(['/chat', conv.id], {
      state: {
        conversation: {
          providerName: this.getOtherName(conv),
          providerAvatar: this.getOtherAvatar(conv)
        }
      }
    });
  }
}