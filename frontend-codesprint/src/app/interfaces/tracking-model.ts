export interface TrackingSessionRequest {
  bookingId: number;
}

// Backend devuelve: trackingSessionId, bookingId, providerProfileId,
//                   trackingState, startedAt, endedAt
export interface TrackingSessionResponse {
  trackingSessionId: number;
  bookingId: number;
  providerProfileId: number;
  trackingState: 'active' | 'ended';
  startedAt: string;
  endedAt: string | null;
}

export interface TrackingPointRequest {
  latitude: number;
  longitude: number;
}

// Backend devuelve: trackingPointId, trackingSessionId,
//                   latitude, longitude, recordedAt
export interface TrackingPointResponse {
  trackingPointId: number;
  trackingSessionId: number;
  latitude: number;
  longitude: number;
  recordedAt: number;
}