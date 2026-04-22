import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consent-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay -->
    <div
      *ngIf="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      (click)="onBackdropClick($event)"
    >
      <!-- Modal -->
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-fadeIn"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">
                Consentimiento de IA
              </h2>
              <p class="text-teal-100 text-sm">
                Asistente de inteligencia artificial
              </p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-4">
          <p class="text-gray-700 text-sm leading-relaxed">
            Esta consulta cuenta con un asistente de inteligencia artificial que
            puede:
          </p>

          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <span
                class="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  class="w-3.5 h-3.5 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="text-gray-600 text-sm"
                >Transcribir la conversación en tiempo real</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  class="w-3.5 h-3.5 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="text-gray-600 text-sm"
                >Asistir al médico con sugerencias clínicas</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  class="w-3.5 h-3.5 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="text-gray-600 text-sm"
                >Generar un resumen de la consulta</span
              >
            </li>
          </ul>

          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p class="text-amber-800 text-xs leading-relaxed">
              <strong>Privacidad:</strong> Sus datos personales (nombre, cédula,
              teléfono) serán filtrados automáticamente y nunca se almacenarán.
              Puede desactivar la IA en cualquier momento durante la consulta.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6 space-y-3">
          <button
            (click)="onAccept()"
            class="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
            [disabled]="loading"
          >
            {{ loading ? 'Procesando...' : 'Aceptar y activar IA' }}
          </button>
          <button
            (click)="onDecline()"
            class="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200 text-sm"
            [disabled]="loading"
          >
            Continuar sin IA
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  ],
})
export class ConsentModalComponent {
  @Input() visible = false;
  @Input() loading = false;
  @Output() accepted = new EventEmitter<boolean>();

  onAccept(): void {
    this.accepted.emit(true);
  }

  onDecline(): void {
    this.accepted.emit(false);
  }

  onBackdropClick(event: MouseEvent): void {
    // No cerrar al hacer click afuera - el consentimiento es obligatorio
    event.stopPropagation();
  }
}