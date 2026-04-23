// ══════════════════════════════════════════════════════
//  chat-ia.ts — Chat IA Conversacional
//  La IA maneja la conversación completa.
//  No hay CHAT_STEPS fijos — cada mensaje va a GPT.
// ══════════════════════════════════════════════════════
import {
  Component, OnInit, inject, ChangeDetectorRef,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroSparkles, heroPaperAirplane, heroArrowPath, heroArrowRight,
  heroCpuChip, heroCheckCircle, heroCalendarDays, heroXMark
} from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { ChatIAService } from '../service/service';
import { ServiceCategoryService, ServiceCategoryResponse } from '../../../services/Admin/ServiceCategoryService';
import {
  ChatMessage,
  ConversationTurn,
  ChatConversationResponse,
  AIRecommendationData,
  BookingDraftRequest,
  BookingDraftResponse,
  BOOKING_STEPS,
} from '../chat-model/chat-model';

type ChatMode = 'conversation' | 'booking';

@Component({
  selector: 'app-chat-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroSparkles, heroPaperAirplane, heroArrowPath, heroArrowRight,
    heroCpuChip, heroCheckCircle, heroCalendarDays, heroXMark
  })],
  templateUrl: './chat-ia.html',
  styleUrl:    './chat-ia.css',
})
export class ChatIAComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private chatService     = inject(ChatIAService);
  private categoryService = inject(ServiceCategoryService);
  private router          = inject(Router);
  private cdr             = inject(ChangeDetectorRef);

  // ── Estado general ────────────────────────────────────
  messages:    ChatMessage[] = [];
  inputText    = '';
  isTyping     = false;
  isLoadingAI  = false;

  // ── Modo del chat ─────────────────────────────────────
  chatMode: ChatMode = 'conversation';

  // ── Historial conversacional ──────────────────────────
  // Este es el cambio clave: en lugar de pasos fijos,
  // mantenemos el historial que se envía a GPT en cada turno
  conversationHistory: ConversationTurn[] = [];

  // ── Categorías de la BD ───────────────────────────────
  availableCategories: string[] = [];

  // ── Datos extraídos de la conversación ───────────────
  // La IA los extrae en la recomendación final
  recommendation: AIRecommendationData | null = null;

  // ── Flujo de agendamiento ─────────────────────────────
  bookingStep   = 0;
  bookingDraft:  BookingDraftResponse | null = null;
  isConfirming  = false;
  bookingAnswers: Partial<BookingDraftRequest> = {};

  // ── Chips dinámicos ───────────────────────────────────
  // Al inicio mostramos las categorías como sugerencias
  // Luego desaparecen para que sea conversación libre
  initialChips: string[] = [];
  showInitialChips = true;

  // ── Booking chips por paso ────────────────────────────
  get currentBookingChips(): string[] {
    if (this.chatMode !== 'booking') return [];
    return BOOKING_STEPS[this.bookingStep]?.chips ?? [];
  }

  get inputBlocked(): boolean {
    return !!this.bookingDraft || this.isTyping || this.isLoadingAI;
  }

  get isBookingComplete(): boolean {
    return this.chatMode === 'booking' && this.bookingStep >= BOOKING_STEPS.length;
  }

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.loadCategoriesAndStart();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // ── Inicialización ────────────────────────────────────
  private loadCategoriesAndStart(): void {
    this.categoryService.getAllActive().subscribe({
      next: (cats: ServiceCategoryResponse[]) => {
        this.availableCategories = cats.map(c => c.categoryName);
        this.initialChips        = this.availableCategories.slice(0, 6); // máx 6 chips
        this.startConversation();
      },
      error: () => {
        // Fallback si falla el backend de categorías
        this.availableCategories = ['Enfermería', 'Fisioterapia', 'Transporte', 'Acompañamiento', 'Compras', 'Trámite'];
        this.initialChips        = this.availableCategories;
        this.startConversation();
      }
    });
  }

  // ── Iniciar conversación con mensaje de bienvenida ────
  // El primer mensaje de bienvenida SÍ está fijo (es solo saludo)
  // pero a partir de la primera respuesta del usuario, GPT toma el control
  private startConversation(): void {
    this.addAIMessage(
      '¡Hola! 👋 Soy tu asistente PuraVidaCare. Contame, ¿qué servicio necesitás para el adulto mayor?'
    );
    this.cdr.detectChanges();
  }

  // ── Enviar mensaje ────────────────────────────────────
  sendMessage(text: string = this.inputText.trim()): void {
    if (!text || this.inputBlocked) return;
    if (this.chatMode === 'booking' && this.isBookingComplete) return;

    this.addUserMessage(text);
    this.inputText       = '';
    this.showInitialChips = false; // ocultar chips después del primer mensaje
    this.isTyping        = true;
    this.cdr.detectChanges();

    if (this.chatMode === 'conversation') {
      this.handleConversationTurn(text);
    } else {
      this.handleBookingStep(text);
    }
  }

  // ── FLUJO CONVERSACIONAL ──────────────────────────────
  private handleConversationTurn(userText: string): void {
    // Agregar el mensaje del usuario al historial
    this.conversationHistory.push({ role: 'user', content: userText });

    this.isTyping    = false;
    this.isLoadingAI = true;
    this.cdr.detectChanges();

    // Enviar el historial completo a la IA
    this.chatService.chat({
      history:             this.conversationHistory,
      availableCategories: this.availableCategories,
    }).subscribe({
      next: (response: ChatConversationResponse) => {
        this.isLoadingAI = false;

        if (!response.success) {
          const errorMsg = response.errorMessage || 'Ocurrió un error. Intentá nuevamente.';
          this.addAIMessage(errorMsg);
          // Remover el último turno del historial para que el usuario pueda reintentar
          this.conversationHistory.pop();
          this.cdr.detectChanges();
          return;
        }

        if (response.type === 'message' && response.message) {
          // La IA sigue preguntando — mostrar su respuesta y agregarla al historial
          this.addAIMessage(response.message);
          this.conversationHistory.push({ role: 'assistant', content: response.message });

        } else if (response.type === 'recommendation' && response.recommendation) {
          // La IA tiene suficiente info — mostrar recomendación
          this.recommendation = response.recommendation;
          this.messages.push({
            id: Date.now().toString(), type: 'recommendation', content: '', timestamp: new Date()
          });
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAI = false;
        this.addAIMessage('No pude procesar tu mensaje. Intentá nuevamente.');
        this.conversationHistory.pop();
        this.cdr.detectChanges();
      }
    });
  }

  // ── FLUJO AGENDAMIENTO ────────────────────────────────
  startBookingFlow(): void {
    if (!this.recommendation) return;

    this.chatMode    = 'booking';
    this.bookingStep = 0;

    this.bookingAnswers = {
      category:  this.recommendation.category,
      zone:      this.recommendation.zone,
      mobility:  this.extractFromHistory('mobility'),
      companion: this.extractFromHistory('companion'),
    };

    this.addAIMessage(
      `¡Perfecto! Voy a ayudarte a agendar tu ${this.recommendation.category}. ` +
      `Solo necesito algunos datos más. 📋`
    );

    setTimeout(() => {
      this.addAIMessage(BOOKING_STEPS[0].question);
      this.cdr.detectChanges();
    }, 800);
  }

  private handleBookingStep(text: string): void {
    const step = BOOKING_STEPS[this.bookingStep];
    (this.bookingAnswers as Record<string, string>)[step.key] = text;
    this.bookingStep++;

    setTimeout(() => {
      this.isTyping = false;

      if (this.bookingStep < BOOKING_STEPS.length) {
        this.addAIMessage(BOOKING_STEPS[this.bookingStep].question);
      } else {
        this.addAIMessage('Preparando tu borrador de reserva... ⏳');
        setTimeout(() => this.callBookingDraftAI(), 600);
      }

      this.cdr.detectChanges();
    }, 700);
  }

  private callBookingDraftAI(): void {
    this.isLoadingAI = true;
    this.cdr.detectChanges();

    this.chatService.createBookingDraft(this.bookingAnswers as BookingDraftRequest).subscribe({
      next: (response) => {
        this.isLoadingAI = false;

        if (!response.success) {
          this.addAIMessage(this.resolveBookingError(response));
          if (response.errorCode === 'INCOMPLETE_DATA') {
            this.bookingStep = Math.max(0, this.bookingStep - 1);
            setTimeout(() => {
              this.addAIMessage(BOOKING_STEPS[this.bookingStep].question);
              this.cdr.detectChanges();
            }, 500);
          }
        } else {
          this.bookingDraft = response;
          this.messages.push({
            id: Date.now().toString(), type: 'booking-draft', content: '', timestamp: new Date()
          });
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAI = false;
        this.addAIMessage('No se pudo preparar el borrador. Por favor intentá nuevamente.');
        this.cdr.detectChanges();
      }
    });
  }

  private resolveBookingError(response: BookingDraftResponse): string {
    switch (response.errorCode) {
      case 'INVALID_DATE':        return '⚠️ La fecha/hora debe ser en el futuro. ¿Podés indicar otra fecha?';
      case 'UNAUTHORIZED_ADULT':  return '🚫 No autorizado para este adulto. Verificá que esté vinculado a tu cuenta.';
      case 'INVALID_CATEGORY':    return '❌ Categoría no válida. Por favor reiniciá la consulta.';
      case 'INCOMPLETE_DATA':     return '📝 Necesito un poco más de información. ' + (response.errorMessage || '');
      default:                    return response.errorMessage || 'Ocurrió un error al preparar la reserva.';
    }
  }

  // ── Confirmar reserva ─────────────────────────────────
  confirmBooking(): void {
    if (!this.bookingDraft?.draftId || this.isConfirming) return;
    this.isConfirming = true;
    this.cdr.detectChanges();

    this.chatService.confirmBookingDraft(this.bookingDraft.draftId).subscribe({
      next: (res) => {
        this.isConfirming = false;
        this.bookingDraft = null;
        this.addAIMessage(
          `✅ ¡Reserva creada! Tu número de reserva es #${res.bookingId}. ` +
          `El proveedor la recibirá y la aceptará en breve.`
        );
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/mis-reservas', res.bookingId]), 2500);
      },
      error: () => {
        this.isConfirming = false;
        this.addAIMessage('No se pudo confirmar la reserva. Intentá nuevamente.');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Ver proveedores ───────────────────────────────────
  goToResults(): void {
    if (!this.recommendation) return;
    this.router.navigate(['/resultados-recomendados'], {
      queryParams: {
        category: this.recommendation.category,
        zone:     this.recommendation.zone,
        service:  this.recommendation.service,
      }
    });
  }

  // ── Reiniciar ─────────────────────────────────────────
  restart(): void {
    this.messages             = [];
    this.conversationHistory  = [];
    this.recommendation       = null;
    this.bookingDraft         = null;
    this.bookingStep          = 0;
    this.chatMode             = 'conversation';
    this.bookingAnswers       = {};
    this.inputText            = '';
    this.isLoadingAI          = false;
    this.isConfirming         = false;
    this.showInitialChips     = true;
    this.loadCategoriesAndStart();
  }

  // ── Extraer datos del historial ───────────────────────
  // Intenta extraer movilidad/acompañante del historial
  // para pre-poblar el booking sin repetirle al usuario
  private extractFromHistory(field: 'mobility' | 'companion'): string {
    const keywords: Record<string, string[]> = {
      mobility:  ['silla', 'bastón', 'camina', 'postrado', 'cama'],
      companion: ['acompañante', 'acompañar', 'solo', 'sola'],
    };

    const text = this.conversationHistory
      .filter(t => t.role === 'user')
      .map(t => t.content.toLowerCase())
      .join(' ');

    for (const kw of keywords[field]) {
      if (text.includes(kw)) return text; // retorna el contexto para que el backend lo procese
    }
    return '';
  }

  // ── Helpers ───────────────────────────────────────────
  private addUserMessage(content: string): void {
    this.messages.push({ id: Date.now().toString(), type: 'user', content, timestamp: new Date() });
  }

  private addAIMessage(content: string): void {
    this.messages.push({ id: Date.now().toString(), type: 'ai', content, timestamp: new Date() });
  }

  private scrollToBottom(): void {
    try { this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }

  formatPrice(price: number | undefined, mode?: string | null): string {
    if (!price) return 'Consultar';
    return `₡ ${price.toLocaleString('es-CR')}${mode === 'hourly' ? ' / hora' : ''}`;
  }
}