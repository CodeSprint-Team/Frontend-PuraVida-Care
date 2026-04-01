import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroStar } from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../components/navbar/navbar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-create-review',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, NavbarComponent],
  viewProviders: [provideIcons({ heroStar, heroArrowLeft })],
  templateUrl: './create-review.html',
  styleUrl: './create-review.css',
})
export class CreateReviewComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);

  providerId = 0;
  bookingId = 0;
  serviceTitle = '';
  providerName = '';
  rating = 0;
  hoverRating = 0;
  comment = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.providerId   = Number(this.route.snapshot.paramMap.get('providerId') ?? '0');
    const params      = this.route.snapshot.queryParams;
    this.bookingId    = Number(params['bookingId'] ?? '0');
    this.serviceTitle = params['serviceTitle'] ?? '';
    this.providerName = params['providerName'] ?? '';
  }

  setRating(value: number): void {
    this.rating = value;
  }

  setHover(value: number): void {
    this.hoverRating = value;
  }

  clearHover(): void {
    this.hoverRating = 0;
  }

  get starsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get isValid(): boolean {
    return this.rating > 0 && this.comment.trim().length > 0 && this.bookingId > 0;
  }

  submit(): void {
    if (!this.isValid) {
      this.errorMessage = 'Seleccioná una calificación y escribí un comentario.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const userRole  = localStorage.getItem('user_role') ?? '';
    const profileId = Number(localStorage.getItem('profile_id') ?? '0');

    const body: any = {
      serviceBookingId: this.bookingId,
      ranking: this.rating,
      comment: this.comment.trim(),
    };

    if (userRole === 'CLIENT') {
      body.clientProfileId = profileId;
    } else if (userRole === 'SENIOR') {
      body.seniorProfileId = profileId;
    }
    this.http.post(`${environment.apiUrl}/reviews/providers/${this.providerId}`, body).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Reseña creada correctamente.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/my-completed-services']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.error || '';
        if (msg.includes('Ya existe')) {
          this.errorMessage = 'Ya dejaste una reseña para este servicio.';
        } else {
          this.errorMessage = msg || 'Error al crear la reseña.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-completed-services']);
  }

  get ratingLabel(): string {
    const labels: { [key: number]: string } = {
      1: 'Malo',
      2: 'Regular',
      3: 'Bueno',
      4: 'Muy bueno',
      5: 'Excelente'
    };
    return labels[this.rating] ?? '';
  }
}