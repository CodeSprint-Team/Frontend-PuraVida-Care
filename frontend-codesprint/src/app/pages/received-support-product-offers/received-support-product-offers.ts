import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SupportProductService } from '../../services/support-product/support-product';
import { ArticleOfferResponse } from '../../interfaces/support-product/article-offer-response.interface';

@Component({
  selector: 'app-received-support-product-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './received-support-product-offers.html',
  styleUrl: './received-support-product-offers.css'
})
export class ReceivedSupportProductOffersComponent implements OnInit {
  offers: ArticleOfferResponse[] = [];
  loading = true;
  actionLoadingId: number | null = null;
  currentUserId: number | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(private supportProductService: SupportProductService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    this.currentUserId = userId ? Number(userId) : null;

    if (!this.currentUserId) {
      this.loading = false;
      this.errorMessage = 'No se pudo identificar al usuario actual.';
      return;
    }

    this.loadOffers();
  }

  loadOffers(): void {
    if (!this.currentUserId) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.supportProductService.getOffersReceived(this.currentUserId).subscribe({
      next: (data) => {
        this.offers = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.offers = [];
        this.loading = false;
        this.errorMessage = err?.error?.message || 'No se pudieron cargar las ofertas recibidas.';
      }
    });
  }

  acceptOffer(offerId: number): void {
    if (!this.currentUserId || this.actionLoadingId !== null) {
      return;
    }

    this.actionLoadingId = offerId;
    this.errorMessage = '';
    this.successMessage = '';

    this.supportProductService.acceptOffer(offerId, {
      ownerUserId: this.currentUserId
    }).subscribe({
      next: () => {
        this.successMessage = 'Oferta aceptada correctamente.';
        this.actionLoadingId = null;
        this.loadOffers();
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMessage = err?.error?.message || 'No se pudo aceptar la oferta.';
      }
    });
  }

  rejectOffer(offerId: number): void {
    if (!this.currentUserId || this.actionLoadingId !== null) {
      return;
    }

    this.actionLoadingId = offerId;
    this.errorMessage = '';
    this.successMessage = '';

    this.supportProductService.rejectOffer(offerId, {
      ownerUserId: this.currentUserId
    }).subscribe({
      next: () => {
        this.successMessage = 'Oferta rechazada correctamente.';
        this.actionLoadingId = null;
        this.loadOffers();
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMessage = err?.error?.message || 'No se pudo rechazar la oferta.';
      }
    });
  }

  getBuyerFullName(offer: ArticleOfferResponse): string {
    const fullName = `${offer.buyerName ??''}`.trim();
    return fullName || 'Usuario';
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }
}