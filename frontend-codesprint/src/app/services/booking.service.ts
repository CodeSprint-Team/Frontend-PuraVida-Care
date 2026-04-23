import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateServiceBookingRequest } from '../interfaces/booking-model';

@Injectable({
  providedIn: 'root'
})
export class ServiceBookingService {

  private apiUrl = 'http://127.0.0.1:8081/api/v1/bookings';

  constructor(private http: HttpClient) {}

  createBooking(data: CreateServiceBookingRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}