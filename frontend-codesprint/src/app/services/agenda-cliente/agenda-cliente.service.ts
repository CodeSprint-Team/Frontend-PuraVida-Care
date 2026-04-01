import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AgendaBookingResponseDTO,
  RescheduleRequestDTO
} from '../../interfaces/client/agenda-booking.interface';

interface ClientProfileByUserResponse {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/agenda-cliente`;
  private readonly profileApiUrl = `${environment.apiUrl}/profiles/client`;

  getClientProfileIdByUserId(userId: number): Observable<number> {
    return this.http
      .get<ClientProfileByUserResponse>(`${this.profileApiUrl}/by-user/${userId}`)
      .pipe(map((profile) => profile.id));
  }

  getAgendaByUserId(userId: number): Observable<AgendaBookingResponseDTO[]> {
    return this.getClientProfileIdByUserId(userId).pipe(
      switchMap((clientProfileId) => this.getAgenda(clientProfileId))
    );
  }

  getAgenda(clientProfileId: number): Observable<AgendaBookingResponseDTO[]> {
    return this.http.get<AgendaBookingResponseDTO[]>(`${this.apiUrl}/${clientProfileId}`);
  }

  getBookingDetail(clientProfileId: number, bookingId: number): Observable<AgendaBookingResponseDTO> {
    return this.http.get<AgendaBookingResponseDTO>(
      `${this.apiUrl}/${clientProfileId}/detail/${bookingId}`
    );
  }

  cancelBooking(clientProfileId: number, bookingId: number): Observable<AgendaBookingResponseDTO> {
    return this.http.put<AgendaBookingResponseDTO>(
      `${this.apiUrl}/${clientProfileId}/cancel/${bookingId}`,
      {}
    );
  }

  rescheduleBooking(
    clientProfileId: number,
    bookingId: number,
    dto: RescheduleRequestDTO
  ): Observable<AgendaBookingResponseDTO> {
    return this.http.put<AgendaBookingResponseDTO>(
      `${this.apiUrl}/${clientProfileId}/reschedule/${bookingId}`,
      dto
    );
  }
}
