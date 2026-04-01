import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceCategoryResponse {
  id: number;
  categoryName: string;
  categoryState: string;
}

export interface ServiceCategoryCreateRequest {
  categoryName: string;
  categoryState: string;
}

export interface ServiceCategoryUpdateRequest {
  categoryName: string;
  categoryState: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceCategoryService {

  private apiUrl = 'http://localhost:8081/api/v1/service-categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ServiceCategoryResponse[]> {
    return this.http.get<ServiceCategoryResponse[]>(this.apiUrl);
  }

  getAllActive(): Observable<ServiceCategoryResponse[]> {
    return this.http.get<ServiceCategoryResponse[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<ServiceCategoryResponse> {
    return this.http.get<ServiceCategoryResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: ServiceCategoryCreateRequest): Observable<ServiceCategoryResponse> {
    return this.http.post<ServiceCategoryResponse>(this.apiUrl, request);
  }

  update(id: number, request: ServiceCategoryUpdateRequest): Observable<ServiceCategoryResponse> {
    return this.http.put<ServiceCategoryResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}