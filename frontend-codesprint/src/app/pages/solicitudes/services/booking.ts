import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingStatusUpdateDTO } from '../models/Booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http    = inject(HttpClient);
  private baseUrl = 'http://localhost:8081/api/v1/booking';

  getBookingsByProvider(providerProfileId: number, status?: string): Observable<Booking[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<Booking[]>(
      `${this.baseUrl}/provider/${providerProfileId}${params}`
    );
  }

  getBookingDetail(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${bookingId}`);
  }

  updateBookingStatus(
    bookingId: number,
    dto: BookingStatusUpdateDTO
  ): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${bookingId}/status`, dto);
  }
}