import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { MapViewerComponent } from '../../components/mapviewer/map-viewer.component';
import { MapService } from '../../services/map.services';
import { MapMarker, MapLayer, MarkerPositionUpdate } from '../../interfaces/filtered-home/map-marker';

const POSITIONS_STORAGE_KEY = 'home_filter_marker_positions';
const IMAGE_STORAGE_KEY      = 'home_filter_background_image';

@Component({
  selector: 'app-home-filter',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, MapViewerComponent],
  templateUrl: './home-filter.component.html',
  styleUrls: ['./home-filter.component.css'],
})
export class HomeFilterComponent implements OnInit {

  private readonly router     = inject(Router);
  private readonly mapService = inject(MapService);

  // ── Estado UI ────────────────────────────────────────────────────────────
  backgroundImage: string | null = null;
  selectedMarker: MapMarker | null = null;
  activeLayers: string[] = ['seguridad', 'medico', 'enfermeria', 'farmacia', 'recepcion', 'transporte'];
  isLayersPanelOpen = false;
  isEditMode = false;
  isSaving = false;

  // ── Datos ─────────────────────────────────────────────────────────────────
  markers: MapMarker[] = [
    {
      id: '1',
      type: 'seguridad',
      title: 'Seguridad Principal',
      description: 'Punto de control 24/7. Registro de visitantes y monitoreo de cámaras.',
      contact: '+506 2222-3333',
      status: 'activo',
      layer: 'seguridad',
      x: 15,
      y: 20,
      icon: '🛡️',
    },
    {
      id: '2',
      type: 'medico',
      title: 'Consultorio Médico',
      description: 'Dr. Carlos Méndez - Medicina General. Horario: L-V 8am-4pm.',
      contact: 'Ext. 101',
      status: 'activo',
      layer: 'medico',
      x: 35,
      y: 30,
      icon: '🩺',
    },
    {
      id: '3',
      type: 'enfermeria',
      title: 'Estación de Enfermería',
      description: 'Atención de enfermería 24/7. Control de signos vitales y medicamentos.',
      contact: 'Ext. 102',
      status: 'activo',
      layer: 'enfermeria',
      x: 60,
      y: 25,
      icon: '💉',
    },
    {
      id: '4',
      type: 'farmacia',
      title: 'Farmacia Interna',
      description: 'Dispensación de medicamentos. Horario: L-S 7am-7pm.',
      contact: 'Ext. 105',
      status: 'activo',
      layer: 'farmacia',
      x: 70,
      y: 50,
      icon: '💊',
    },
    {
      id: '5',
      type: 'recepcion',
      title: 'Recepción Principal',
      description: 'Información, registro de visitas y asistencia general.',
      contact: '+506 2222-3344',
      status: 'activo',
      layer: 'recepcion',
      x: 25,
      y: 60,
      icon: '📋',
    },
    {
      id: '6',
      type: 'transporte',
      title: 'Zona de Transporte',
      description: 'Parada de buses y taxis. Servicio de transporte especial disponible.',
      contact: 'Ext. 110',
      status: 'activo',
      layer: 'transporte',
      x: 80,
      y: 75,
      icon: '🚐',
    },
    {
      id: '7',
      type: 'seguridad',
      title: 'Salida de Emergencia',
      description: 'Salida secundaria. Mantener despejada. Alarma conectada.',
      status: 'activo',
      layer: 'seguridad',
      x: 85,
      y: 35,
      icon: '🚨',
    },
    {
      id: '8',
      type: 'medico',
      title: 'Sala de Terapia Física',
      description: 'Rehabilitación y fisioterapia. Cita previa requerida.',
      contact: 'Ext. 103',
      status: 'activo',
      layer: 'medico',
      x: 45,
      y: 65,
      icon: '🏥',
    },
  ];

  layers: MapLayer[] = [
    {
      id: 'seguridad',
      name: 'Seguridad',
      icon: 'fa-solid fa-shield',
      color: 'bg-red-600',
      textColor: 'text-red-600',
      borderColor: 'border-red-600',
      description: 'Puntos de control y emergencia',
    },
    {
      id: 'medico',
      name: 'Médico',
      icon: 'fa-solid fa-stethoscope',
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-600',
      description: 'Consultorios y atención médica',
    },
    {
      id: 'enfermeria',
      name: 'Enfermería',
      icon: 'fa-solid fa-heart-pulse',
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-600',
      description: 'Estaciones de enfermería',
    },
    {
      id: 'farmacia',
      name: 'Farmacia',
      icon: 'fa-solid fa-capsules',
      color: 'bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-600',
      description: 'Dispensación de medicamentos',
    },
    {
      id: 'recepcion',
      name: 'Recepción',
      icon: 'fa-solid fa-user',
      color: 'bg-teal-600',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-600',
      description: 'Información y registro',
    },
    {
      id: 'transporte',
      name: 'Transporte',
      icon: 'fa-solid fa-bus',
      color: 'bg-orange-600',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-600',
      description: 'Zonas de transporte',
    },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadLocalImage();
    this.loadPositions();
  }

  // ── Imagen ────────────────────────────────────────────────────────────────

  private loadLocalImage(): void {
    const saved = sessionStorage.getItem(IMAGE_STORAGE_KEY);
    if (saved) this.backgroundImage = saved;
  }

  // ── Posiciones ────────────────────────────────────────────────────────────

  /**
   * Estrategia dual:
   * 1. Intenta cargar del backend si hay bookingId válido.
   * 2. Si falla o devuelve vacío → carga de localStorage.
   * 3. Si tampoco hay en localStorage → usa posiciones default del array.
   */
  private loadPositions(): void {
    const bookingId = this.resolveBookingId();

    if (bookingId) {
      this.mapService.getPositions(bookingId).subscribe({
        next: (positions) => {
          if (positions.length) {
            this.applyPositions(positions);
          } else {
            this.loadLocalPositions();
          }
        },
      });
    } else {
      this.loadLocalPositions();
    }
  }

  private loadLocalPositions(): void {
    try {
      const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (!raw) return;
      const positions: MarkerPositionUpdate[] = JSON.parse(raw);
      this.applyPositions(positions);
    } catch {
      // JSON corrupto — ignorar
    }
  }

  private applyPositions(positions: MarkerPositionUpdate[]): void {
    positions.forEach((pos) => {
      const marker = this.markers.find((m) => m.id === pos.markerId);
      if (marker) {
        marker.x = pos.x;
        marker.y = pos.y;
      }
    });
  }

  /**
   * Guarda posiciones:
   * 1. Siempre guarda en localStorage (funciona sin backend).
   * 2. Si hay bookingId, también intenta guardar en backend.
   *    Si el backend falla (403/404/sin endpoint) no rompe la app.
   */
  savePositions(): void {
    this.isSaving = true;

    const positions: MarkerPositionUpdate[] = this.markers.map((m) => ({
      markerId: m.id,
      x: Math.round(m.x * 10) / 10,
      y: Math.round(m.y * 10) / 10,
    }));

    // Guarda localmente siempre
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));

    const bookingId = this.resolveBookingId();

    if (bookingId) {
      this.mapService.savePositions(bookingId, positions).subscribe({
        next: () => this.finishSave(),
        error: () => this.finishSave(), // local ya guardó, no es error crítico
      });
    } else {
      this.finishSave();
    }
  }

  private finishSave(): void {
    this.isSaving   = false;
    this.isEditMode = false;
  }

private resolveBookingId(): number | null {
  return null;
}

  // ── Handlers de MapViewerComponent ───────────────────────────────────────

  onMarkerSelected(marker: MapMarker | null): void {
    this.selectedMarker = marker;
  }

  onMarkerMoved(event: { id: string | number; x: number; y: number }): void {
    const marker = this.markers.find((m) => m.id === event.id);
    if (marker) {
      marker.x = event.x;
      marker.y = event.y;
    }
  }

  onImageChanged(objectUrl: string): void {
    this.backgroundImage = objectUrl;
    sessionStorage.setItem(IMAGE_STORAGE_KEY, objectUrl);
  }

  onImageRemoved(): void {
    this.backgroundImage = null;
    sessionStorage.removeItem(IMAGE_STORAGE_KEY);
  }

  // ── Marcadores ────────────────────────────────────────────────────────────

  clearSelectedMarker(): void {
    this.selectedMarker = null;
  }

  getVisibleMarkers(): MapMarker[] {
    return this.markers.filter((m) => this.activeLayers.includes(m.layer));
  }

  getLayerCount(layerId: string): number {
    return this.markers.filter((m) => m.layer === layerId).length;
  }

  getMarkerColor(layerId: string): string {
    return this.layers.find((l) => l.id === layerId)?.color ?? 'bg-gray-500';
  }

  // ── Capas ─────────────────────────────────────────────────────────────────

  toggleLayer(layerId: string): void {
    const idx = this.activeLayers.indexOf(layerId);
    if (idx === -1) {
      this.activeLayers.push(layerId);
    } else {
      this.activeLayers.splice(idx, 1);
    }
    if (this.selectedMarker && !this.activeLayers.includes(this.selectedMarker.layer)) {
      this.selectedMarker = null;
    }
  }

  toggleLayersPanel(): void {
    this.isLayersPanelOpen = !this.isLayersPanelOpen;
  }

  closeLayersPanel(): void {
    this.isLayersPanelOpen = false;
  }

  // ── Modo edición ──────────────────────────────────────────────────────────

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.loadPositions();
    }
  }

  // ── Navegación ────────────────────────────────────────────────────────────

  goBack(): void {
    const userId = localStorage.getItem('user_id') ?? '';
    this.router.navigate(['/family-profile', userId]);
  }

  goToChecklist(): void {
    this.router.navigate(['/checklist-hogar']);
  }

  goToEditMarkers(): void {
    this.router.navigate(['/editar-hogar-marcadores']);
  }
}