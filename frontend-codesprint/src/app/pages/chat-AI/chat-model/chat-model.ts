// ══════════════════════════════════════════════════════
//  chat-model.ts — Modelos del Chat IA Conversacional
//  Ya no hay CHAT_STEPS fijos — la IA maneja la conversación
// ══════════════════════════════════════════════════════

export interface ChatMessage {
  id:        string;
  type:      'user' | 'ai' | 'recommendation' | 'booking-draft';
  content:   string;
  timestamp: Date;
}

// ── Mensaje del historial para enviar a la IA ─────────
// Representa cada turno de la conversación
export interface ConversationTurn {
  role:    'user' | 'assistant';
  content: string;
}

// ── Request conversacional ────────────────────────────
// En lugar de {need, date, mobility, companion, zone},
// ahora enviamos el historial completo al backend.
// La IA decide qué preguntar y cuándo recomendar.
export interface ChatConversationRequest {
  history:              ConversationTurn[];   // Historial completo de la conversación
  availableCategories?: string[];             // Categorías reales de la BD
}

// ── Respuesta de la IA ────────────────────────────────
// La IA puede responder de dos formas:
// 1. Un mensaje conversacional (sigue preguntando)
// 2. Una recomendación final (tiene suficiente info)
export interface ChatConversationResponse {
  type:            'message' | 'recommendation';  // Qué tipo de respuesta es
  message?:        string;                         // Mensaje conversacional
  recommendation?: AIRecommendationData;           // Recomendación final
  success:         boolean;
  errorMessage?:   string;
}

export interface AIRecommendationData {
  category: string;
  service:  string;
  reason:   string;
  zone:     string;
}

// ── Para compatibilidad con el resto del sistema ──────
// BookingDraft no cambia
export interface BookingDraftRequest {
  category:           string;
  zone:               string;
  mobility:           string;
  companion:          string;
  careServiceId?:     number;
  scheduledAt:        string;
  originAddress:      string;
  destinationAddress: string;
  originLatitude?:    number;
  originLongitude?:   number;
  destinationLatitude?:  number;
  destinationLongitude?: number;
  notes?:             string;
  seniorProfileId?:   number;
}

export interface BookingDraftResponse {
  draftId:            string;
  careServiceId?:     number;
  providerName?:      string;
  providerImage?:     string;
  serviceTitle?:      string;
  category:           string;
  scheduledAt:        string;
  originAddress:      string;
  destinationAddress: string;
  zone:               string;
  mobility:           string;
  companion:          string;
  agreedPrice?:       number;
  agreedPriceMode?:   string;
  notes?:             string;
  seniorName?:        string;
  success:            boolean;
  errorMessage:       string;
  errorCode?:         'INCOMPLETE_DATA' | 'INVALID_DATE' | 'UNAUTHORIZED_ADULT' | 'INVALID_CATEGORY' | 'UNKNOWN';
}

export interface BookingConfirmResponse {
  bookingId:     number;
  bookingStatus: string;
  message:       string;
}

export interface BookingStep {
  key:      keyof Pick<BookingDraftRequest,
    'scheduledAt' | 'originAddress' | 'destinationAddress' | 'notes'>;
  question: string;
  chips:    string[];
  optional: boolean;
}

export const BOOKING_STEPS: BookingStep[] = [
  {
    key:      'scheduledAt',
    question: '📅 ¿Qué fecha y hora necesitás? (Ej: "Mañana a las 9 am")',
    chips:    ['Hoy en la tarde', 'Mañana por la mañana', 'Esta semana', 'Próxima semana'],
    optional: false,
  },
  {
    key:      'originAddress',
    question: '🏠 ¿Desde dónde saldrá el adulto mayor? (Dirección de recogida)',
    chips:    [],
    optional: false,
  },
  {
    key:      'destinationAddress',
    question: '🏥 ¿A dónde necesitás ir? (Hospital, clínica, farmacia, etc.)',
    chips:    ['Hospital México', 'CCSS más cercana', 'Clínica privada', 'Farmacia'],
    optional: false,
  },
  {
    key:      'notes',
    question: '📝 ¿Alguna indicación especial? Escribe "ninguna" si no hay.',
    chips:    ['Ninguna', 'Requiere silla de ruedas', 'Adulto con audífono', 'Necesita espera en destino'],
    optional: true,
  },
];