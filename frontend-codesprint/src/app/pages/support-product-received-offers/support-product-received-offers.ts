import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroCheck,
  heroXMark,
  heroInbox,
  heroClock,
  heroUser,
  heroTag,
} from '@ng-icons/heroicons/outline';

import { NavbarComponent } from '../../components/navbar/navbar';
import { SupportProductService } from '../../services/support-product/support-product';
import { ArticleOfferResponse } from '../../interfaces/support-product/article-offer-response.interface';

@Component({
  selector: 'app-support-product-received-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroArrowLeft,
      heroCheck,
      heroXMark,
      heroInbox,
      heroClock,
      heroUser,
      heroTag,
    }),
  ],
  templateUrl: './support-product-received-offers.html',
  styleUrl: './support-product-received-offers.css',
})
export class SupportProductReceivedOffers implements OnInit {
  offers: ArticleOfferResponse[] = [];
  loading = true;
  currentUserId: number | null = null;
  actionLoadingId: number | null = null;

  successMessage = '';
  errorMessage = '';

  constructor(
    private supportProductService: SupportProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    this.currentUserId = userId ? Number(userId) : null;
    this.loadOffers();
  }

  loadOffers(): void {
    if (!this.currentUserId) {
      this.loading = false;
      this.errorMessage = 'No se pudo identificar al usuario.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.supportProductService.getOffersReceived(this.currentUserId).subscribe({
      next: (data) => {
        console.log('OFFERS =>', data);
        this.offers = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || err?.error || 'No se pudieron cargar las ofertas recibidas.';
        this.cdr.detectChanges();
      },
    });
  }

  acceptOffer(offerId: number): void {
  if (!this.currentUserId) {
      return;
    }

    const confirmed = window.confirm('¿Seguro que querés aceptar esta oferta?');
    if (!confirmed) {
      return;
    }

    this.actionLoadingId = offerId;
    this.successMessage = '';
    this.errorMessage = '';

    this.supportProductService.acceptOffer(offerId, {
      ownerUserId: this.currentUserId,
    }).subscribe({
      next: () => {
        this.successMessage = 'Oferta aceptada correctamente.';
        this.actionLoadingId = null;
        this.loadOffers();
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMessage =
          err?.error?.message || err?.error || 'No se pudo aceptar la oferta.';
        this.cdr.detectChanges();
      },
    });
  }

  rejectOffer(offerId: number): void {
  if (!this.currentUserId) {
      return;
    }

    const confirmed = window.confirm('¿Seguro que querés rechazar esta oferta?');
    if (!confirmed) {
      return;
    }

    this.actionLoadingId = offerId;
    this.successMessage = '';
    this.errorMessage = '';

    this.supportProductService.rejectOffer(offerId, {
      ownerUserId: this.currentUserId,
    }).subscribe({
      next: () => {
        this.successMessage = 'Oferta rechazada correctamente.';
        this.actionLoadingId = null;
        this.loadOffers();
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMessage =
          err?.error?.message || err?.error || 'No se pudo rechazar la oferta.';
        this.cdr.detectChanges();
      },
    });
  }

  getStateLabel(state: string): string {
    switch (state) {
      case 'PENDING':
        return 'Pendiente';
      case 'ACCEPTED':
        return 'Aceptada';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return state;
    }
  }

  getStateClasses(state: string): string {
    switch (state) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getImageUrl(offer: ArticleOfferResponse): string | null {
    if (!offer.supportProductImageUrl) {
      return null;
    }

    if (offer.supportProductImageUrl.startsWith('http')) {
      return offer.supportProductImageUrl;
    }

    return `http://127.0.0.1:8081/${offer.supportProductImageUrl}`;
  }
}