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

export interface CreateServiceBookingRequest {
  userId: number;
  clientProfileId: number | null;
  seniorProfileId: number | null;
  careServiceId: number;
  scheduledAt: string;
  originText: string | null;
  destinationText: string | null;
  originLatitude: number | null;
  originLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  agreedPrice: number;
  agreedPriceMode: string;
}