export interface DetalleCita {
  citaId: string;
  bookingId: number;
  servicio: {
    nombre: string;
    subtitulo: string;
  };
  fecha: string;
  hora: string;
  duracionEstimada: string;
  origen: string;
  destino: string;
  notas: string;
  proveedor: {
    emoji: string;
    nombre: string;
    especialidad: string;
    telefono: string;
  };
  paciente: {
    nombre: string;
    reservadoPor: string;
    fechaReserva: string;
  };
  precio: string;
  status: 'Programado' | 'Hoy' | 'Completado' | 'Cancelado';
  rawStatus: string;
  providerProfileId: number;
}
