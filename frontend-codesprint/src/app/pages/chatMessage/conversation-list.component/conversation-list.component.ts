import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass, heroChatBubbleLeftRight,
  heroPaperAirplane, heroTrash, heroCheckCircle,
  heroXCircle, heroXMark
} from '@ng-icons/heroicons/outline';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ChatService, ConversationDTO } from '../chat.service/chat.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../../components/navbar/navbar';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-conversation-list',
  templateUrl: './conversation-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroMagnifyingGlass, heroChatBubbleLeftRight,
    heroPaperAirplane, heroTrash, heroCheckCircle,
    heroXCircle, heroXMark
  })]
})
export class ConversationListComponent implements OnInit, OnDestroy {
  conversations:   ConversationDTO[] = [];
  searchQuery    = '';
  loading        = true;
  errorMessage   = '';
  deletingId:      number | null = null;
  confirmDeleteId: number | null = null;

  emailSearch    = '';
  searchingEmail = false;
  emailError     = '';
  foundUser: { userId: number; name: string; avatar: string; email: string } | null = null;

  toasts: Toast[] = [];
  private toastCounter  = 0;
  private routerSub!: Subscription; // ← para el router events

  currentUserId!: number;

  constructor(
    private router:      Router,
    private chatService: ChatService,
    private authService: AuthService,
    private cdr:         ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserId = Number(this.authService.getUserId());
    this.loadConversations();

    // Recargar cada vez que se navega de vuelta a /mensajes
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      if (e.urlAfterRedirects === '/mensajes' || e.url === '/mensajes') {
        this.loadConversations();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  loadConversations(): void {
    this.loading = true;
    this.chatService.getConversations(this.currentUserId).subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading       = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las conversaciones.';
        this.loading      = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Toast ─────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type });
    this.cdr.detectChanges();
    setTimeout(() => {
      this.removeToast(id);
    }, 3500);
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }

  // ── Búsqueda por email ────────────────────────────────────────
  searchByEmail(): void {
    const email = this.emailSearch.trim();
    if (!email) return;

    this.searchingEmail = true;
    this.emailError     = '';
    this.foundUser      = null;

    this.chatService.searchUserByEmail(email).subscribe({
      next: (user) => {
        if (user.userId === this.currentUserId) {
          this.emailError     = 'Ese es tu propio correo.';
          this.searchingEmail = false;
          this.cdr.detectChanges();
          return;
        }
        this.foundUser      = user;
        this.searchingEmail = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.emailError     = 'No se encontró ningún usuario con ese correo.';
        this.searchingEmail = false;
        this.cdr.detectChanges();
      }
    });
  }

  openChatWithFound(): void {
    if (!this.foundUser) return;

    this.chatService.getOrCreateDirectConversation(this.currentUserId, this.foundUser.userId)
      .subscribe({
        next: (conversationId) => {
          this.router.navigate(['/chat', conversationId], {
            state: {
              conversation: {
                providerName:   this.foundUser!.name,
                providerAvatar: this.foundUser!.avatar
              }
            }
          });
        },
        error: () => {
          this.emailError = 'No se pudo abrir la conversación. Intentá de nuevo.';
          this.cdr.detectChanges();
        }
      });
  }

  clearSearch(): void {
    this.emailSearch = '';
    this.foundUser   = null;
    this.emailError  = '';
  }

  // ── Eliminar ──────────────────────────────────────────────────
  askDeleteConfirm(conv: ConversationDTO, event: Event): void {
    event.stopPropagation();
    this.confirmDeleteId = conv.id;
  }

  cancelDelete(event: Event): void {
    event.stopPropagation();
    this.confirmDeleteId = null;
  }

  confirmDelete(conv: ConversationDTO, event: Event): void {
    event.stopPropagation();
    this.confirmDeleteId = null;
    this.deletingId      = conv.id;

    this.chatService.deleteConversation(conv.id, this.currentUserId).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(c => c.id !== conv.id);
        this.deletingId    = null;
        this.showToast('Conversación eliminada', 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.deletingId = null;
        this.showToast('No se pudo eliminar la conversación', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  trackByConvId(index: number, conv: ConversationDTO): number {
    return conv.id;
  }

  get filtered(): ConversationDTO[] {
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c =>
      c.providerName?.toLowerCase().includes(q) ||
      c.clientName?.toLowerCase().includes(q)
    );
  }

  get totalUnread(): number {
    return this.conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  }

  getOtherName(conv: ConversationDTO): string {
    if (Number(conv.clientUserId) === this.currentUserId) return conv.providerName ?? 'Usuario';
    if (Number(conv.providerUserId) === this.currentUserId) return conv.clientName ?? 'Usuario';
    return 'Usuario';
  }

  getOtherAvatar(conv: ConversationDTO): string {
    if (Number(conv.clientUserId) === this.currentUserId) {
      return conv.providerAvatar ?? this.fallbackAvatar(this.getOtherName(conv));
    }
    if (Number(conv.providerUserId) === this.currentUserId) {
      return conv.clientAvatar ?? this.fallbackAvatar(this.getOtherName(conv));
    }
    return this.fallbackAvatar('Usuario');
  }

  private fallbackAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff`;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    const date    = new Date(isoString);
    const now     = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit' });
  }

  openChat(conv: ConversationDTO): void {
    if (this.confirmDeleteId === conv.id) return;
    this.router.navigate(['/chat', conv.id], {
      state: {
        conversation: {
          providerName:   this.getOtherName(conv),
          providerAvatar: this.getOtherAvatar(conv)
        }
      }
    });
  }
}