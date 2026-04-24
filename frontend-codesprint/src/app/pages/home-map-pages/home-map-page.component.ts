import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { MapViewerComponent } from '../../components/mapviewer/map-viewer.component';
import { AuthService } from '../../services/auth.service';
import { MapMarker, MapLayer } from '../../interfaces/filtered-home/map-marker';

@Component({
  selector: 'app-home-map-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MapViewerComponent],
  templateUrl: './home-map-page.component.html',
})
export class HomeMapPageComponent implements OnInit {
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly auth    = inject(AuthService, { optional: true });

  // El rol determina si puede editar
  isEditable = false;
  isEditMode = false;
  backgroundImage: string | null = null;
  selectedMarker: MapMarker | null = null;
  activeLayers: string[] = [];

  // Datos de ejemplo — en producción vendrían del backend
  markers: MapMarker[] = [
    { id: '1', title: 'Seguridad Principal', description: 'Control 24/7', status: 'activo', layer: 'seguridad', x: 15, y: 20, icon: '🛡️' },
    { id: '2', title: 'Consultorio Médico',  description: 'Dr. Méndez',   status: 'activo', layer: 'medico',    x: 35, y: 30, icon: '🩺' },
    { id: '3', title: 'Enfermería',          description: '24/7',          status: 'activo', layer: 'enfermeria',x: 60, y: 25, icon: '💉' },
  ];

  layers: MapLayer[] = [
    { id: 'seguridad',  name: 'Seguridad',  icon: 'fa-solid fa-shield',      color: 'bg-red-600',    textColor: 'text-red-600',    borderColor: 'border-red-600',    description: 'Puntos de control' },
    { id: 'medico',     name: 'Médico',     icon: 'fa-solid fa-stethoscope', color: 'bg-blue-600',   textColor: 'text-blue-600',   borderColor: 'border-blue-600',   description: 'Atención médica' },
    { id: 'enfermeria', name: 'Enfermería', icon: 'fa-solid fa-heart-pulse', color: 'bg-purple-600', textColor: 'text-purple-600', borderColor: 'border-purple-600', description: 'Estaciones' },
  ];

  ngOnInit(): void {
    const role = (this.auth?.getUserRole() ?? '').toUpperCase();
    // Cliente y Admin pueden editar; Proveedor solo visualiza
    this.isEditable = role === 'CLIENT' || role === 'ADMIN';
    // Todas las capas activas por defecto
    this.activeLayers = this.layers.map(l => l.id);
  }

  toggleLayer(layerId: string): void {
    const idx = this.activeLayers.indexOf(layerId);
    this.activeLayers = idx === -1
      ? [...this.activeLayers, layerId]
      : this.activeLayers.filter(l => l !== layerId);
  }

  onMarkerMoved(event: { id: string | number; x: number; y: number }): void {
    const m = this.markers.find(mk => mk.id === event.id);
    if (m) { m.x = event.x; m.y = event.y; }
  }

  savePositions(): void {
    console.log('Guardar en backend:', this.markers.map(m => ({ id: m.id, x: m.x, y: m.y })));
    // this.mapService.savePositions(bookingId, positions).subscribe(...)
    this.isEditMode = false;
  }

  goBack(): void { this.router.navigate(['/']); }
}