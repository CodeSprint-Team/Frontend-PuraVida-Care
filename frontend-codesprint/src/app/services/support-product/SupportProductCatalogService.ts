import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupportProductCatalogResponse {
  id: number;
  category: string;
  baseName: string;
  baseDescription: string;
  active: boolean;
}

export interface SupportProductCatalogCreateRequest {
  category: string;
  baseName: string;
  baseDescription: string;
  active: boolean;
}

export interface SupportProductCatalogUpdateRequest {
  category: string;
  baseName: string;
  baseDescription: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SupportProductCatalogService {

  private apiUrl = 'http://localhost:8081/api/v1/support-product-catalogs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SupportProductCatalogResponse[]> {
    return this.http.get<SupportProductCatalogResponse[]>(this.apiUrl);
  }

  getAllActive(): Observable<SupportProductCatalogResponse[]> {
    return this.http.get<SupportProductCatalogResponse[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<SupportProductCatalogResponse> {
    return this.http.get<SupportProductCatalogResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: SupportProductCatalogCreateRequest): Observable<SupportProductCatalogResponse> {
    return this.http.post<SupportProductCatalogResponse>(this.apiUrl, request);
  }

  update(id: number, request: SupportProductCatalogUpdateRequest): Observable<SupportProductCatalogResponse> {
    return this.http.put<SupportProductCatalogResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}