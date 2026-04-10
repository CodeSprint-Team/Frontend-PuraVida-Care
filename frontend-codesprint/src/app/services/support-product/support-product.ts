import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupportProductPostResponse } from '../../interfaces/support-product/support-product-response.interface';

@Injectable({
  providedIn: 'root'
})
export class SupportProductService {

private apiUrl = 'http://127.0.0.1:8081/api/v1/support-products';



  constructor(private http: HttpClient) {}

  createPost(formData: FormData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, formData);
  }

  getAllPosts(): Observable<SupportProductPostResponse[]> {
    return this.http.get<SupportProductPostResponse[]>(`${this.apiUrl}`);
  }

  getPostById(id: number): Observable<SupportProductPostResponse> {
    return this.http.get<SupportProductPostResponse>(`${this.apiUrl}/${id}`);
  }

  updatePost(id: number, data: any): Observable<SupportProductPostResponse> {
  return this.http.put<SupportProductPostResponse>(`${this.apiUrl}/${id}`, data);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}