export interface MapMarker {
  id: string | number;
  type?: string;          // ← agregar esta línea (opcional, para compatibilidad)
  title: string;
  description?: string;
  contact?: string;
  status: 'activo' | 'inactivo';
  layer: string;
  x: number;
  y: number;
  icon: string;
  categoria?: string;
  isDragging?: boolean;
}

export interface MapLayer {
  id: string;
  name: string;
  icon: string;
  color: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export interface MarkerPositionUpdate {
  markerId: string | number;
  x: number;
  y: number;
}