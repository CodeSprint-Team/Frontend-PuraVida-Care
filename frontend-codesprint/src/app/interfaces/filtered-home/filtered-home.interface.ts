export type EstadoReserva = 'PENDIENTE' | 'ACEPTADA' | 'EN_CURSO' | 'COMPLETADA';

export interface Reserva {
  id: number;
  estado: EstadoReserva;
  cliente: string;
  servicio: string;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface PermisoCategoria {
  reservaId: number;
  categoria: string;
  activo: boolean;
  sensible?: boolean;
}

export interface Marcador {
  id: number;
  reservaId: number;
  categoria: string;
  imagen?: string;
  nombre: string;
  descripcion?: string;
}

export interface FilteredHomeBackendItem {
  markerId: number;
  bookingId: number;
  bookingStatus: string;
  scheduledAt?: string;
  clientName?: string;
  serviceTitle?: string;
  category: string;
  roomName: string;
  title: string;
  description?: string;
}
