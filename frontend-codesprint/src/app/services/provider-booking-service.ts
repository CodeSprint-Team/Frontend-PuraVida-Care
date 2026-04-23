import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ServiceBookingResponse,
  BookingActionRequest,
  BookingActionResponse,
} from '../interfaces/booking-model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProviderBookingService {
  private readonly bookingsUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getBookingsByProvider(
    providerProfileId: number,
    status?: string
  ): Observable<ServiceBookingResponse[]> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status.toUpperCase());
    }
    return this.http.get<ServiceBookingResponse[]>(
      `${this.bookingsUrl}/provider/${providerProfileId}`,
      { params }
    );
  }

  respondToBooking(
    bookingId: number,
    providerProfileId: number,
    body: BookingActionRequest
  ): Observable<BookingActionResponse> {
    const params = new HttpParams().set('providerProfileId', providerProfileId);
    return this.http.patch<BookingActionResponse>(
      `${this.bookingsUrl}/${bookingId}/respond`,
      body,
      { params }
    );
  }

  startService(
    bookingId: number,
    providerProfileId: number
  ): Observable<BookingActionResponse> {
    const params = new HttpParams().set('providerProfileId', providerProfileId);
    return this.http.patch<BookingActionResponse>(
      `${this.bookingsUrl}/${bookingId}/start-service`,
      {},
      { params }
    );
  }

  completeService(
    bookingId: number,
    providerProfileId: number
  ): Observable<BookingActionResponse> {
    const params = new HttpParams().set('providerProfileId', providerProfileId);
    return this.http.patch<BookingActionResponse>(
      `${this.bookingsUrl}/${bookingId}/complete`,
      {},
      { params }
    );
  }

 cancelBooking(
  bookingId: number,
  providerProfileId: number,
  dto: { cancellationReason: string }
) {
  const params = new HttpParams().set('providerProfileId', providerProfileId);

  return this.http.patch<BookingActionResponse>(
    `${this.bookingsUrl}/${bookingId}/cancel`,
    dto,
    { params }
  );
}
  
}