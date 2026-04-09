import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupportProductPostResponse } from '../../interfaces/support-product/support-product-response.interface';
import { ArticleOfferResponse } from '../../interfaces/support-product/article-offer-response.interface';
import { CreateArticleOfferRequest } from '../../interfaces/support-product/create-article-offer-request.interface';
import { OfferActionRequest } from '../../interfaces/support-product/offer-action-request.interface';

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

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createOffer(data: CreateArticleOfferRequest): Observable<ArticleOfferResponse> {
    return this.http.post<ArticleOfferResponse>(`${this.apiUrl}/offers`, data);
  }

  acceptOffer(offerId: number, data: OfferActionRequest): Observable<ArticleOfferResponse> {
    return this.http.patch<ArticleOfferResponse>(`${this.apiUrl}/offers/${offerId}/accept`, data);
  }

  rejectOffer(offerId: number, data: OfferActionRequest): Observable<ArticleOfferResponse> {
    return this.http.patch<ArticleOfferResponse>(`${this.apiUrl}/offers/${offerId}/reject`, data);
  }

  getOffersByPostId(postId: number): Observable<ArticleOfferResponse[]> {
    return this.http.get<ArticleOfferResponse[]>(`${this.apiUrl}/offers/post/${postId}`);
  }

  getOffersReceived(ownerUserId: number): Observable<ArticleOfferResponse[]> {
    return this.http.get<ArticleOfferResponse[]>(`${this.apiUrl}/offers/received/${ownerUserId}`);
  }

  getOffersMade(buyerUserId: number): Observable<ArticleOfferResponse[]> {
    return this.http.get<ArticleOfferResponse[]>(`${this.apiUrl}/offers/made/${buyerUserId}`);
  }
}