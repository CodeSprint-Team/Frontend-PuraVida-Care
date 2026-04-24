import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MarkerPositionUpdate } from '../interfaces/filtered-home/map-marker';

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  savePositions(bookingId: number, positions: MarkerPositionUpdate[]): Observable<void> {
    return this.http.patch<void>(
      `${environment.apiUrl}/filtered-home/${bookingId}/marker-positions`,
      { positions },
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of(undefined as void)));
  }

  getPositions(bookingId: number): Observable<MarkerPositionUpdate[]> {
    return this.http.get<MarkerPositionUpdate[]>(
      `${environment.apiUrl}/filtered-home/${bookingId}/marker-positions`,
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of([])));
  }
}