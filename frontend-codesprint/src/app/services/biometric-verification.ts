import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IdentityVerificationResponse {
  id: number;
  userId: number;
  verificationStatus: 'pendiente' | 'aprobado' | 'rechazado';
  rejectionReason: string | null;
  files: {
    id: number;
    fileType: string;
    url: string;
    path: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class BiometricVerification {

  private apiUrl = 'http://localhost:8080/api/v1/verifications';

  constructor(private http: HttpClient) {}

  create(
    userId: number,
    selfie: File,
    idFront: File,
    idBack: File
  ): Observable<IdentityVerificationResponse> {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('selfie',  selfie);
    formData.append('idFront', idFront);
    formData.append('idBack',  idBack);

    return this.http.post<IdentityVerificationResponse>(this.apiUrl, formData);
  }
}