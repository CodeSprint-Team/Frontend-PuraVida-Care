import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // Ajusta esta URL a la dirección de tu API real
  private apiUrl = 'https://api.tudominio.com/api/profile';

  constructor(private http: HttpClient) {}

  // Este método guarda los cambios
  updateProfile(data: { phone: string; notes: string }): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  // Opcional: Este método sirve para traer los datos actuales al abrir la pantalla
  getProfile(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}