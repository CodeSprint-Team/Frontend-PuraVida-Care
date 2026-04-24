export interface AgendaBookingResponseDTO {
  bookingId: number;
  bookingStatus: string;
  scheduledAt: string;
  agreedPrice: number;
  agreedPriceMode: string;
  rejectionReason: string | null;
  createdAt: string;

  serviceTitle: string;
  serviceDescription: string;
  categoryName: string;

  providerProfileId: number;
  providerFullName: string;
  providerTypeName: string;
  providerPhone: string;
  providerZone: string;
  providerProfileImage: string | null;

  seniorProfileId: number;
  seniorFullName: string;
  seniorAddress: string;

  clientProfileId: number;
  clientFullName: string;

  originLatitude: number | null;
  originLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;

  appointmentType?: string;
  telemedSessionId?: number | null;
}

export interface RescheduleRequestDTO {
  scheduledAt: string;
  rescheduleReason: string;
}

export interface CancelBookingRequestDTO {
  cancellationReason: string;
}