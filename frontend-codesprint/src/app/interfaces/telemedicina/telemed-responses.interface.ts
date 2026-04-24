// ============================================================
// Interfaces que mapean los DTOs del backend
// Package: com.cenfotec.backendcodesprint.logic.Telemedicina.Dto
// ============================================================

// ─── Requests ───

export interface ConsentRequest {
  accepted: boolean;
}

export interface EndSessionRequest {
  providerName: string;
  durationMinutes: number;
}

// ─── Responses simples ───

export interface ConsentResponse {
  sessionId: string;
  accepted: boolean;
  timestamp: string;
  message?: string;
}

export interface TranscriptResponse {
  sessionId: string;
  transcript: string;
  wordCount?: number;
}

export interface AiHealthResponse {
  status: string;
  aiAvailable: boolean;
  timestamp?: string;
}

// ─── End Session Response ───

export interface EndSessionResponse {
  sessionId: string;
  hasRecord: boolean;
  iaStatus: AiStatus;
  record?: AiMedicalRecord | null;
  message?: string;
}

// ─── Enums ───

export type AiStatus =
  | 'NOT_CONSENTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'DEACTIVATED';

// ─── WebSocket payloads ───

export interface TranscriptionResult {
  cleanText: string;
  language: string;
  detectedSymptoms?: string[];
  piiRedacted?: boolean;
  timestamp?: string;
}

export interface ClinicalAnalysisResult {
  symptomsSummary: string;
  possibleDiagnoses: Diagnosis[];
  suggestedQuestions: string[];
  riskFlags: string[];
  recommendedTests: string[];
  clinicalNotes: string;
}

export interface Diagnosis {
  name: string;
  cie10: string;
  probability: string;
}

// ─── Expediente generado por IA (formato real del backend) ───

export interface AiMedicalRecord {
  session_id?: string;
  provider_name?: string;
  session_duration_minutes?: number;
  clinical_summary?: ClinicalSummary;
  full_transcript_clean?: string;
  ai_disclaimer?: string;
}

export interface ClinicalSummary {
  chief_complaint?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string[];
  recommendations?: string[];
  follow_up?: string;
  // Fallback para propiedades que el backend pueda agregar después
  [key: string]: any;
}

// ─── WebSocket error ───

export interface WsError {
  message: string;
}

export interface JaasTokenResponse {
  token: string;
  appId: string;
  roomName: string;
  domain: string;   // ⬅ agregar esta línea
}