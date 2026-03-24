import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProviderSearchResult, ProviderSearchFilters } from '../Models/ProviderSearchResult';

@Injectable({ providedIn: 'root' })
export class ProviderSearchService {
  private http    = inject(HttpClient);
  private baseUrl = 'http://localhost:8081/api/v1/search/providers';

  search(filters: Partial<ProviderSearchFilters>): Observable<ProviderSearchResult[]> {
    let params = new HttpParams();

    if (filters.name)         params = params.set('name',         filters.name);
    if (filters.zone)         params = params.set('zone',         filters.zone);
    if (filters.minPrice)     params = params.set('minPrice',     filters.minPrice);
    if (filters.maxPrice)     params = params.set('maxPrice',     filters.maxPrice);
    if (filters.minRating)    params = params.set('minRating',    filters.minRating);
    if (filters.category)     params = params.set('category',     filters.category);
    if (filters.verifiedOnly) params = params.set('verifiedOnly', 'true');

    return this.http.get<ProviderSearchResult[]>(this.baseUrl, { params });
  }
}