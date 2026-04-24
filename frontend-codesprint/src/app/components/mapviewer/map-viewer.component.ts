import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapMarker, MapLayer } from '../../interfaces/filtered-home/map-marker';

@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapViewerComponent implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  // ── Inputs ─────────────────────────────────────────────────────────────────
  @Input() markers: MapMarker[] = [];
  @Input() layers: MapLayer[] = [];
  @Input() backgroundImage: string | null = null;
  @Input() editable = false;
  @Input() activeLayers: string[] = [];
  @Input() showLayerBadges = true;

  // ── Outputs ────────────────────────────────────────────────────────────────
  @Output() markerSelected   = new EventEmitter<MapMarker | null>();
  @Output() markerMoved      = new EventEmitter<{ id: string | number; x: number; y: number }>();
  @Output() imageChanged     = new EventEmitter<string>();
  @Output() imageRemoved     = new EventEmitter<void>();

  // ── Refs ───────────────────────────────────────────────────────────────────
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  // ── State ──────────────────────────────────────────────────────────────────
  selectedMarker: MapMarker | null = null;
  draggingMarker: MapMarker | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // ── Derived ────────────────────────────────────────────────────────────────

  /**
   * Marcadores visibles según las capas activas.
   * Array vacío = ninguna capa activa = no se muestra ningún marcador.
   * Se eliminó el "if vacío → mostrar todos" que causaba el bug.
   */
  get visibleMarkers(): MapMarker[] {
    return this.markers.filter(m => this.activeLayers.includes(m.layer));
  }

  getLayerColor(layerId: string): string {
    return this.layers.find(l => l.id === layerId)?.color ?? 'bg-gray-500';
  }

  // ── Marker selection ───────────────────────────────────────────────────────

  selectMarker(marker: MapMarker, event: Event): void {
    event.stopPropagation();
    if (this.draggingMarker) return;
    this.selectedMarker = this.selectedMarker?.id === marker.id ? null : marker;
    this.markerSelected.emit(this.selectedMarker);
    this.cdr.markForCheck();
  }

  clearSelection(): void {
    this.selectedMarker = null;
    this.markerSelected.emit(null);
    this.cdr.markForCheck();
  }

  // ── Drag & drop (solo si editable) ────────────────────────────────────────

  startDrag(event: MouseEvent | TouchEvent, marker: MapMarker): void {
    if (!this.editable) return;
    event.preventDefault();

    this.draggingMarker = marker;
    marker.isDragging = true;

    const container = this.mapContainer.nativeElement;
    const { clientX, clientY } = this.getClientXY(event);

    this.dragOffsetX = clientX - container.getBoundingClientRect().left
                       - (marker.x / 100) * container.offsetWidth;
    this.dragOffsetY = clientY - container.getBoundingClientRect().top
                       - (marker.y / 100) * container.offsetHeight;

    document.addEventListener('mousemove', this.onDrag, { passive: false });
    document.addEventListener('mouseup',   this.stopDrag);
    document.addEventListener('touchmove', this.onDrag, { passive: false });
    document.addEventListener('touchend',  this.stopDrag);

    this.cdr.markForCheck();
  }

  private onDrag = (event: MouseEvent | TouchEvent): void => {
    if (!this.draggingMarker || !this.mapContainer) return;
    event.preventDefault();

    const container = this.mapContainer.nativeElement;
    const rect      = container.getBoundingClientRect();
    const { clientX, clientY } = this.getClientXY(event);

    const rawX = clientX - rect.left - this.dragOffsetX;
    const rawY = clientY - rect.top  - this.dragOffsetY;

    this.draggingMarker.x = Math.min(100, Math.max(0, (rawX / rect.width)  * 100));
    this.draggingMarker.y = Math.min(100, Math.max(0, (rawY / rect.height) * 100));

    this.cdr.markForCheck();
  };

  private stopDrag = (): void => {
    if (this.draggingMarker) {
      this.markerMoved.emit({
        id: this.draggingMarker.id,
        x:  this.draggingMarker.x,
        y:  this.draggingMarker.y,
      });
      this.draggingMarker.isDragging = false;
      this.draggingMarker = null;
    }

    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup',   this.stopDrag);
    document.removeEventListener('touchmove', this.onDrag);
    document.removeEventListener('touchend',  this.stopDrag);

    this.cdr.markForCheck();
  };

  // ── Image upload ───────────────────────────────────────────────────────────

  onFileChange(event: Event): void {
    if (!this.editable) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 10MB.');
      return;
    }
    this.imageChanged.emit(URL.createObjectURL(file));
  }

  removeImage(): void {
    if (!this.editable) return;
    this.imageRemoved.emit();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private getClientXY(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    return e instanceof MouseEvent
      ? { clientX: e.clientX, clientY: e.clientY }
      : { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup',   this.stopDrag);
    document.removeEventListener('touchmove', this.onDrag);
    document.removeEventListener('touchend',  this.stopDrag);
  }
}