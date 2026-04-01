import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
  id: number;
  title: string;
  serviceDescription: string;
  basePrice: number;
  priceMode: string;
  publicationState: string;
  providerProfile: { id: number; };
  serviceCategory: {
    id: number;
    categoryName?: string;
  };
  created?: string;
  updated?: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  paused: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:8081/api/v1/services';

  constructor(private http: HttpClient) {}

  // Obtener servicios por proveedor
  getServicesByProvider(providerId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/provider/${providerId}`);
  }

  // Obtener un servicio por ID
  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo servicio
  createService(service: any): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  // Actualizar servicio
  updateService(id: number, service: any): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  // Cambiar estado (toggle)
  toggleStatus(id: number): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/${id}/toggle`, {});
  }

  // Cambiar estado específico
  setStatus(id: number, status: string): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Eliminar servicio
  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener estadísticas
  getStats(providerId: number): Observable<ServiceStats> {
    return this.http.get<ServiceStats>(`${this.apiUrl}/provider/${providerId}/stats`);
  }
}