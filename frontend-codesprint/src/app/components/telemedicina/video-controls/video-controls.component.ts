import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white border-t border-gray-200 px-3 sm:px-8 py-3 sm:py-5"
    >
      <div class="flex items-center justify-center gap-2 sm:gap-4">
        <!-- Micrófono -->
        <button
          (click)="micToggled.emit()"
          class="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-colors duration-200"
          [ngClass]="{
            'bg-gray-100 hover:bg-gray-200 text-gray-700': isMicOn,
            'bg-red-500 hover:bg-red-600 text-white': !isMicOn
          }"
          [attr.aria-label]="isMicOn ? 'Silenciar micrófono' : 'Activar micrófono'"
        >
          <!-- Mic On -->
          <svg
            *ngIf="isMicOn"
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <!-- Mic Off -->
          <svg
            *ngIf="!isMicOn"
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        </button>

        <!-- Cámara -->
        <button
          (click)="cameraToggled.emit()"
          class="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-colors duration-200"
          [ngClass]="{
            'bg-gray-100 hover:bg-gray-200 text-gray-700': isCameraOn,
            'bg-red-500 hover:bg-red-600 text-white': !isCameraOn
          }"
          [attr.aria-label]="isCameraOn ? 'Desactivar cámara' : 'Activar cámara'"
        >
          <!-- Camera On -->
          <svg
            *ngIf="isCameraOn"
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <!-- Camera Off -->
          <svg
            *ngIf="!isCameraOn"
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </button>

        <!-- Subtítulos IA -->
        <button
          (click)="subtitlesToggled.emit()"
          class="h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-colors duration-200"
          [ngClass]="{
            'bg-teal-600 hover:bg-teal-700 text-white': showSubtitles,
            'bg-gray-100 hover:bg-gray-200 text-gray-700': !showSubtitles
          }"
          aria-label="Subtítulos IA"
        >
          <svg
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </button>

        <!-- Expediente (solo doctor) -->
        <button
          *ngIf="userRole === 'doctor'"
          (click)="recordClicked.emit()"
          class="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 items-center justify-center transition-colors duration-200 hidden sm:flex"
          aria-label="Expediente médico"
        >
          <svg
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>

        <!-- Salud (solo paciente) -->
        <button
          *ngIf="userRole === 'patient'"
          (click)="healthClicked.emit()"
          class="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 items-center justify-center transition-colors duration-200 hidden sm:flex"
          aria-label="Mi salud"
        >
          <svg
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        <!-- Finalizar -->
        <button
          (click)="endCallClicked.emit()"
          class="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors duration-200"
          aria-label="Finalizar llamada"
        >
          <svg
            class="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
            />
          </svg>
        </button>
      </div>

      <!-- Labels (solo desktop) -->
      <div
        class="text-center mt-2 sm:mt-3 text-xs text-gray-500 hidden md:flex items-center justify-center gap-6"
      >
        <span>Micrófono</span>
        <span>Cámara</span>
        <span>Subtítulos IA</span>
        <span>{{ userRole === 'doctor' ? 'Expediente' : 'Mi salud' }}</span>
        <span>Finalizar</span>
      </div>
    </div>
  `,
})
export class VideoControlsComponent {
  @Input() isMicOn = true;
  @Input() isCameraOn = true;
  @Input() showSubtitles = true;
  @Input() userRole: 'doctor' | 'patient' = 'doctor';

  @Output() micToggled = new EventEmitter<void>();
  @Output() cameraToggled = new EventEmitter<void>();
  @Output() subtitlesToggled = new EventEmitter<void>();
  @Output() recordClicked = new EventEmitter<void>();
  @Output() healthClicked = new EventEmitter<void>();
  @Output() endCallClicked = new EventEmitter<void>();
}