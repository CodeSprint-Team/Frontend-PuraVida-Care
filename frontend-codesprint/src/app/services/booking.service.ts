import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateServiceBookingRequest, ServiceBookingResponse } from '../interfaces/booking-model';

@Injectable({
  providedIn: 'root'
})
export class ServiceBookingService {

  private apiUrl = 'http://127.0.0.1:8081/api/v1/bookings';

  constructor(private http: HttpClient) {}

  createBooking(data: CreateServiceBookingRequest): Observable<ServiceBookingResponse> {
    return this.http.post<ServiceBookingResponse>(this.apiUrl, data);
  }
}