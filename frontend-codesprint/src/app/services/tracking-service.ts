import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TrackingSessionRequest,
  TrackingSessionResponse,
  TrackingPointRequest,
  TrackingPointResponse,
} from '../interfaces/tracking-model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  private readonly trackingUrl = `${environment.apiUrl}/tracking`;
  private readonly simulationUrl = `${environment.apiUrl}/simulation`;

  constructor(private http: HttpClient) {}

  // ─── Sesiones ───────────────────────────────────────────

  startTracking(
    providerProfileId: number,
    body: TrackingSessionRequest
  ): Observable<TrackingSessionResponse> {
    const params = new HttpParams().set('providerProfileId', providerProfileId);
    return this.http.post<TrackingSessionResponse>(
      `${this.trackingUrl}/sessions`,
      body,
      { params }
    );
  }

  endTracking(
    sessionId: number,
    providerProfileId: number
  ): Observable<TrackingSessionResponse> {
    const params = new HttpParams().set('providerProfileId', providerProfileId);
    return this.http.patch<TrackingSessionResponse>(
      `${this.trackingUrl}/sessions/${sessionId}/end`,
      {},
      { params }
    );
  }

  getTrackingSession(sessionId: number): Observable<TrackingSessionResponse> {
    return this.http.get<TrackingSessionResponse>(
      `${this.trackingUrl}/sessions/${sessionId}`
    );
  }

  // ─── Puntos ─────────────────────────────────────────────

  addTrackingPoint(
    sessionId: number,
    providerProfileId: number,
    body: TrackingPointRequest
  ): Observable<TrackingPointResponse> {
    const params = new HttpParams().set('providerProfileId', providerProfileId);
    return this.http.patch<TrackingPointResponse>(
      `${this.trackingUrl}/sessions/${sessionId}/points`,
      body,
      { params }
    );
  }

  getTrackingPoints(sessionId: number): Observable<TrackingPointResponse[]> {
    return this.http.get<TrackingPointResponse[]>(
      `${this.trackingUrl}/sessions/${sessionId}/points/history`
    );
  }

  // ─── Simulación (solo dev) ──────────────────────────────

  simulateRoute(
    sessionId: number,
    providerProfileId: number,
    waypoints: number[][],
    pointsPerSegment: number = 15,
    intervalMs: number = 1500
  ): Observable<any> {
    const params = new HttpParams().set('providerProfileId', providerProfileId);
    return this.http.post(
      `${this.simulationUrl}/sessions/${sessionId}/simulate-route`,
      { waypoints, pointsPerSegment, intervalMs },
      { params }
    );
  }
}