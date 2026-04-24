import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroInbox,
  heroClock,
  heroTag,
} from '@ng-icons/heroicons/outline';

import { NavbarComponent } from '../../components/navbar/navbar';
import { SupportProductService } from '../../services/support-product/support-product';
import { ArticleOfferResponse } from '../../interfaces/support-product/article-offer-response.interface';

declare var paypal: any;

@Component({
  selector: 'app-support-product-made-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroArrowLeft,
      heroInbox,
      heroClock,
      heroTag,
    }),
  ],
  templateUrl: './support-product-made-offers.html',
  styleUrl: './support-product-made-offers.css',
})
export class SupportProductMadeOffers implements OnInit {
  offers: ArticleOfferResponse[] = [];
  loading = true;
  currentUserId: number | null = null;
  errorMessage = '';
  successMessage = '';

  isPayModalOpen = false;
  selectedOffer: ArticleOfferResponse | null = null;
  paypalRendered = false;

  constructor(
    private supportProductService: SupportProductService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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

    this.supportProductService.getOffersMade(this.currentUserId).subscribe({
      next: (data) => {
        this.offers = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || err?.error || 'No se pudieron cargar las ofertas realizadas.';
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

  canPay(offer: ArticleOfferResponse): boolean {
    return offer.offerState === 'ACCEPTED' && offer.publicationState === 'PENDING';
  }

  openPayModal(offer: ArticleOfferResponse): void {
    this.selectedOffer = offer;
    this.isPayModalOpen = true;
    this.paypalRendered = false;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.renderPaypalButton();
    }, 0);
  }

  closePayModal(): void {
    this.isPayModalOpen = false;
    this.selectedOffer = null;
    this.paypalRendered = false;

    const container = document.getElementById('paypal-button-container-made-offers');
    if (container) {
      container.innerHTML = '';
    }

    this.cdr.detectChanges();
  }

  renderPaypalButton(): void {
    if (!this.selectedOffer || this.paypalRendered) {
      return;
    }

    const container = document.getElementById('paypal-button-container-made-offers');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    paypal.Buttons({
      createOrder: async (_data: any, _actions: any) => {
        try {
          const amount = Number(this.selectedOffer!.amount).toFixed(2);

          const orderId = await this.supportProductService
            .createPaypalOrder(Number(amount))
            .toPromise();

          if (!orderId) {
            throw new Error('El backend no devolvió un orderId válido');
          }

          return orderId;
        } catch (error) {
          console.error('Error creando orden en backend:', error);
          alert('No se pudo crear la orden de PayPal');
          throw error;
        }
      },

      onApprove: async (data: any, _actions: any) => {
        try {
          const status = await this.supportProductService
            .capturePaypalOrder(data.orderID, this.selectedOffer!.supportProductPostId)
            .toPromise();

          if (status === 'COMPLETED') {
            this.ngZone.run(() => {
              this.successMessage = 'Pago completado con éxito.';
              this.closePayModal();
              this.loadOffers();
            });
            return;
          }

          alert('El pago no se completó correctamente');
        } catch (error) {
          console.error('Error capturando orden en backend:', error);
          alert('No se pudo capturar el pago');
          throw error;
        }
      },

      onError: (err: any) => {
        console.error('Error PayPal SDK:', err);
        alert('Error en el pago');
      }
    }).render('#paypal-button-container-made-offers');

    this.paypalRendered = true;
  }
}