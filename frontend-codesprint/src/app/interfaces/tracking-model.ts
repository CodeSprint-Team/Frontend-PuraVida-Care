export interface TrackingSessionRequest {
  bookingId: number;
}

export interface TrackingSessionResponse {
  trackingSessionId: number;
  bookingId: number;
  providerProfileId: number;
  trackingState: 'active' | 'ended';
  startedAt: string;
  endedAt: string | null;

  // Coordenadas del booking 
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

export interface TrackingPointRequest {
  latitude: number;
  longitude: number;
}

export interface TrackingPointResponse {
  trackingPointId: number;
  trackingSessionId: number;
  latitude: number;
  longitude: number;
  recordedAt: number;
}