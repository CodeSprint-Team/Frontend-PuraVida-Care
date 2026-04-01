// ─── Booking Models ───────────────────────────────────────

export interface ServiceBookingResponse {
  bookingId: number;
  bookingStatus: 'EN_CURSO' | 'PENDIENTE' | 'RECHAZADA' | 'COMPLETADA' | 'ACEPTADA';
  scheduledAt: string;
  clientProfileId: number;
  clientName: string;
  seniorName: string;
  seniorProfileId: number;
  serviceTitle: string;
  careServiceId: number;
  agreedPrice: number;
  agreedPriceMode: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

export interface BookingActionRequest {
  action: 'ACEPTAR' | 'RECHAZAR';
  reason?: string;
}

export interface BookingActionResponse {
  id: number;
  status: string;
  message: string;
}