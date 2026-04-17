
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilteredHomeService {

  private baseUrl = `${environment.apiUrl}/filtered-home`;

  constructor(private http: HttpClient) {}

  getFilteredHome(bookingId: number, providerProfileId: number, layer?: string) {
    let params = new HttpParams().set('providerProfileId', providerProfileId);
    if (layer && layer !== 'Todas') {
      params = params.set('layer', layer);
    }

    return this.http.get<any>(`${this.baseUrl}/${bookingId}`, { params });
  }
}
