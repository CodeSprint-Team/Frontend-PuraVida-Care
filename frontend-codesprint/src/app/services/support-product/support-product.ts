import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupportProductPostResponse } from '../../interfaces/support-product/support-product-response.interface';

@Injectable({
  providedIn: 'root'
})
export class SupportProductService {

  private apiUrl = 'http://localhost:8081/api/v1/support-products';

  constructor(private http: HttpClient) {}

  createPost(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  getAllPosts(): Observable<SupportProductPostResponse[]> {
    return this.http.get<SupportProductPostResponse[]>(`${this.apiUrl}`);
  }

  getPostById(id: number): Observable<SupportProductPostResponse> {
    return this.http.get<SupportProductPostResponse>(`${this.apiUrl}/${id}`);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}