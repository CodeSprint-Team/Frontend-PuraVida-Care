import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface TelemedHistoryItem {
  sessionId: number;
  endedAt: string;
  aiStatus: string;
  record?: {
    provider_name?: string;
    session_duration_minutes?: number;
    clinical_summary?: {
      chief_complaint?: string;
      diagnosis?: string;
      treatment?: string;
      prescriptions?: string[];
      recommendations?: string[];
      follow_up?: string;
      [key: string]: any;
    };
    full_transcript_clean?: string;
    ai_disclaimer?: string;
  };
}

@Component({
  selector: 'app-telemed-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100 mt-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <svg class="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">Mis teleconsultas</h2>
            <p class="text-sm text-gray-500">Historial de consultas médicas con IA</p>
          </div>
        </div>
        <span class="text-sm text-gray-400 font-medium">
          {{ sessions.length }} consulta{{ sessions.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-purple-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-sm text-gray-400">Cargando historial...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && sessions.length === 0" class="text-center py-10 text-gray-400">
        <svg class="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <p class="text-sm">No hay teleconsultas registradas aún.</p>
      </div>

      <!-- Sessions list -->
      <div *ngIf="!loading && sessions.length > 0" class="space-y-4">
        <div *ngFor="let session of sessions"
             class="border border-gray-200 rounded-2xl overflow-hidden transition-all"
             [ngClass]="{ 'border-purple-200': expandedId === session.sessionId }">

          <!-- Session header (clickeable) -->
          <button
            (click)="toggleExpand(session.sessionId)"
            class="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <!-- Status icon -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                   [ngClass]="{
                     'bg-green-100': session.aiStatus === 'COMPLETED',
                     'bg-amber-100': session.aiStatus === 'PARTIAL',
                     'bg-gray-100': session.aiStatus !== 'COMPLETED' && session.aiStatus !== 'PARTIAL'
                   }">
                <svg *ngIf="session.aiStatus === 'COMPLETED'" class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg *ngIf="session.aiStatus !== 'COMPLETED'" class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              <!-- Info -->
              <div class="text-left">
                <p class="font-semibold text-gray-900 text-sm">
                  Consulta #{{ session.sessionId }}
                  <span *ngIf="session.record?.provider_name" class="text-gray-500 font-normal">
                    — Dr. {{ session.record?.provider_name }}
                  </span>
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ formatDate(session.endedAt) }}
                  <span *ngIf="session.record?.session_duration_minutes">
                    · {{ session.record?.session_duration_minutes }} min
                  </span>
                </p>
              </div>
            </div>

            <!-- Expand arrow -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium px-2 py-1 rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-700': session.aiStatus === 'COMPLETED',
                      'bg-amber-100 text-amber-700': session.aiStatus === 'PARTIAL',
                      'bg-gray-100 text-gray-600': session.aiStatus !== 'COMPLETED' && session.aiStatus !== 'PARTIAL'
                    }">
                {{ getStatusLabel(session.aiStatus) }}
              </span>
              <svg class="h-5 w-5 text-gray-400 transition-transform"
                   [ngClass]="{ 'rotate-180': expandedId === session.sessionId }"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </button>

          <!-- Expanded content -->
          <div *ngIf="expandedId === session.sessionId" class="px-5 pb-5 border-t border-gray-100">
            <ng-container *ngIf="session.record?.clinical_summary as cs">
              <div class="pt-4 space-y-4">

                <div *ngIf="cs.chief_complaint" class="bg-purple-50 rounded-xl p-4">
                  <h4 class="font-semibold text-sm text-purple-900 mb-1">Motivo de consulta</h4>
                  <p class="text-sm text-purple-800">{{ cs.chief_complaint }}</p>
                </div>

                <div *ngIf="cs.diagnosis" class="bg-blue-50 rounded-xl p-4">
                  <h4 class="font-semibold text-sm text-blue-900 mb-1">Diagnóstico</h4>
                  <p class="text-sm text-blue-800">{{ cs.diagnosis }}</p>
                </div>

                <div *ngIf="cs.treatment" class="bg-green-50 rounded-xl p-4">
                  <h4 class="font-semibold text-sm text-green-900 mb-1">Tratamiento</h4>
                  <p class="text-sm text-green-800">{{ cs.treatment }}</p>
                </div>

                <div *ngIf="cs.prescriptions?.length" class="bg-amber-50 rounded-xl p-4">
                  <h4 class="font-semibold text-sm text-amber-900 mb-1">Medicamentos</h4>
                  <div *ngFor="let p of cs.prescriptions" class="text-sm text-amber-800 flex items-start gap-2">
                    <span class="text-amber-600 mt-0.5">•</span>
                    <span>{{ p }}</span>
                  </div>
                </div>

                <div *ngIf="cs.recommendations?.length" class="bg-teal-50 rounded-xl p-4">
                  <h4 class="font-semibold text-sm text-teal-900 mb-1">Recomendaciones</h4>
                  <div *ngFor="let r of cs.recommendations" class="text-sm text-teal-800 flex items-start gap-2">
                    <span class="text-teal-600 mt-0.5">•</span>
                    <span>{{ r }}</span>
                  </div>
                </div>

                <div *ngIf="cs.follow_up" class="bg-indigo-50 rounded-xl p-4">
                  <h4 class="font-semibold text-sm text-indigo-900 mb-1">Seguimiento</h4>
                  <p class="text-sm text-indigo-800">{{ cs.follow_up }}</p>
                </div>
              </div>
            </ng-container>

            <!-- Sin análisis -->
            <div *ngIf="!session.record?.clinical_summary" class="pt-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 italic">
                  No hay análisis clínico disponible para esta consulta.
                </p>
              </div>
            </div>

            <!-- Disclaimer -->
            <p *ngIf="session.record?.ai_disclaimer"
               class="text-xs text-gray-400 italic mt-4 bg-gray-50 rounded-lg p-3 text-center">
              {{ session.record?.ai_disclaimer }}
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TelemedHistoryComponent implements OnInit {
  /** ID del senior profile para cargar el historial */
  @Input() seniorProfileId: string = '';

  private http = inject(HttpClient);

  sessions: TelemedHistoryItem[] = [];
  loading = false;
  expandedId: number | null = null;

  ngOnInit(): void {
    if (this.seniorProfileId) {
      this.loadHistory();
    }
  }

  private loadHistory(): void {
    this.loading = true;
    this.http.get<TelemedHistoryItem[]>(
      `${environment.apiUrl}/telemedicina-controll/telemed-sessions/senior/${this.seniorProfileId}/history`
    ).subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        console.warn('Error cargando historial de teleconsultas:', err);
        this.sessions = [];
        this.loading = false;
      }
    });
  }

  toggleExpand(sessionId: number): void {
    this.expandedId = this.expandedId === sessionId ? null : sessionId;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'COMPLETED': 'IA completa',
      'PARTIAL': 'Parcial',
      'UNAVAILABLE': 'Sin IA',
      'NOT_CONSENTED': 'Sin consentimiento',
      'DEACTIVATED': 'IA desactivada',
    };
    return labels[status] || status;
  }
}