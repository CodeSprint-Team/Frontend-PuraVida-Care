import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

interface Marker {
  id: string;
  type: string;
  title: string;
  description: string;
  contact?: string;
  status: 'activo' | 'inactivo';
  layer: 'seguridad' | 'medico' | 'enfermeria' | 'farmacia' | 'recepcion' | 'transporte';
  x: number;
  y: number;
  icon: string;
  isDragging?: boolean;
}

interface Layer {
  id: string;
  name: string;
  icon: string;
  color: string;
  textColor: string;
  borderColor: string;
  description: string;
}

@Component({
  selector: 'app-home-filter',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './home-filter.component.html',
  styleUrls: ['./home-filter.component.css']
})
export class HomeFilterComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  backgroundImage: string | null = null;
  selectedMarker: Marker | null = null;
  activeLayers: string[] = ['seguridad', 'medico'];
  isLayersPanelOpen = false;
  isEditMode = false;
  draggingMarker: Marker | null = null;
  dragStartX = 0;
  dragStartY = 0;

  markers: Marker[] = [
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
    icon: '🛡️'
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
    icon: '🩺'
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
    icon: '💉'
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
    icon: '💊'
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
    icon: '📋'
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
    icon: '🚐'
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
    icon: '🚨'
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
    icon: '🏥'
  }
];

  layers: Layer[] = [
    {
      id: 'seguridad',
      name: 'Seguridad',
      icon: 'fa-solid fa-shield',
      color: 'bg-red-600',
      textColor: 'text-red-600',
      borderColor: 'border-red-600',
      description: 'Puntos de control y emergencia'
    },
    {
      id: 'medico',
      name: 'Médico',
      icon: 'fa-solid fa-stethoscope',
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-600',
      description: 'Consultorios y atención médica'
    },
    {
      id: 'enfermeria',
      name: 'Enfermería',
      icon: 'fa-solid fa-heart-pulse',
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-600',
      description: 'Estaciones de enfermería'
    },
    {
      id: 'farmacia',
      name: 'Farmacia',
      icon: 'fa-solid fa-capsules',
      color: 'bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-600',
      description: 'Dispensación de medicamentos'
    },
    {
      id: 'recepcion',
      name: 'Recepción',
      icon: 'fa-solid fa-user',
      color: 'bg-teal-600',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-600',
      description: 'Información y registro'
    },
    {
      id: 'transporte',
      name: 'Transporte',
      icon: 'fa-solid fa-bus',
      color: 'bg-orange-600',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-600',
      description: 'Zonas de transporte'
    }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initDraggableMarkers();
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.saveMarkerPositions();
    }
  }

  startDrag(event: MouseEvent | TouchEvent, marker: Marker): void {
    if (!this.isEditMode) return;
    
    event.preventDefault();
    this.draggingMarker = marker;
    marker.isDragging = true;
    
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    
    this.dragStartX = clientX - (marker.x * (this.mapContainer?.nativeElement.offsetWidth || 0) / 100);
    this.dragStartY = clientY - (marker.y * (this.mapContainer?.nativeElement.offsetHeight || 0) / 100);
    
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
    document.addEventListener('touchmove', this.onDrag);
    document.addEventListener('touchend', this.stopDrag);
  }

  onDrag = (event: MouseEvent | TouchEvent): void => {
    if (!this.draggingMarker || !this.mapContainer) return;
    
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    
    const containerRect = this.mapContainer.nativeElement.getBoundingClientRect();
    let newX = ((clientX - this.dragStartX) / containerRect.width) * 100;
    let newY = ((clientY - this.dragStartY) / containerRect.height) * 100;
    
    newX = Math.min(100, Math.max(0, newX));
    newY = Math.min(100, Math.max(0, newY));
    
    this.draggingMarker.x = newX;
    this.draggingMarker.y = newY;
  }

  stopDrag = (): void => {
    if (this.draggingMarker) {
      this.draggingMarker.isDragging = false;
      this.draggingMarker = null;
    }
    
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('touchmove', this.onDrag);
    document.removeEventListener('touchend', this.stopDrag);
  }

  saveMarkerPositions(): void {
    console.log('Posiciones guardadas:', this.markers.map(m => ({ id: m.id, x: m.x, y: m.y })));
  }

  initDraggableMarkers(): void {}

  goBack(): void { this.router.navigate(['/']); }
  goToChecklist(): void { this.router.navigate(['/checklist-hogar']); }
  goToEditMarkers(): void { this.router.navigate(['/editar-hogar-marcadores']); }
  
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. El tamaño máximo es 10MB.');
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      this.backgroundImage = objectUrl;
    }
  }

  removeImage(): void { this.backgroundImage = null; }
  
  toggleLayer(layerId: string): void {
    const index = this.activeLayers.indexOf(layerId);
    if (index === -1) {
      this.activeLayers.push(layerId);
    } else {
      this.activeLayers.splice(index, 1);
    }
    this.selectedMarker = null;
  }

  selectMarker(marker: Marker): void { this.selectedMarker = marker; }
  clearSelectedMarker(): void { this.selectedMarker = null; }
  
  getVisibleMarkers(): Marker[] {
    return this.markers.filter(m => this.activeLayers.includes(m.layer));
  }

  getMarkerColor(layer: string): string {
    const layerData = this.layers.find(l => l.id === layer);
    return layerData?.color || 'bg-gray-600';
  }

  toggleLayersPanel(): void { this.isLayersPanelOpen = !this.isLayersPanelOpen; }
  closeLayersPanel(): void { this.isLayersPanelOpen = false; }
}