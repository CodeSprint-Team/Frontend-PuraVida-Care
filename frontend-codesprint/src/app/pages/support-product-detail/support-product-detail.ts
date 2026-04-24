import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMapPin,
  heroTag,
  heroArrowLeft,
  heroEnvelope,
  heroUser,
  heroClock,
} from '@ng-icons/heroicons/outline';

import { NavbarComponent } from '../../components/navbar/navbar';
import { SupportProductService } from '../../services/support-product/support-product';
import { SupportProductPostResponse } from '../../interfaces/support-product/support-product-response.interface';
import { ArticleOfferResponse } from '../../interfaces/support-product/article-offer-response.interface';

declare var paypal: any;

@Component({
  selector: 'app-support-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NgIconComponent, FormsModule],
  viewProviders: [
    provideIcons({
      heroMapPin,
      heroTag,
      heroArrowLeft,
      heroEnvelope,
      heroUser,
      heroClock,
    }),
  ],
  templateUrl: './support-product-detail.html',
  styleUrl: './support-product-detail.css',
})
export class SupportProductDetail implements OnInit {
  product: SupportProductPostResponse | null = null;
  loading = true;

  isImageOpen = false;
  selectedImage: string | null = null;

  isMapOpen = false;

  currentUserId: number | null = null;

  isOfferModalOpen = false;
  isBuyModalOpen = false;

  offerAmount: number | null = null;
  offerMessage = '';
  offerLoading = false;
  offerError = '';
  offerSuccess = '';
  paymentSuccess = '';
  paymentError = '';

  hasCurrentUserOffer = false;
  userOfferMessage = '';

  paypalRendered = false;

  private offerSuccessTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private supportProductService: SupportProductService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    this.currentUserId = userId ? Number(userId) : null;
    this.loadProduct();
  }

  loadProduct(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;

    this.supportProductService.getPostById(id).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.product = data;
          this.checkIfCurrentUserAlreadyOffered();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.product = null;
          this.loading = false;
          this.hasCurrentUserOffer = false;
          this.userOfferMessage = '';
          this.cdr.detectChanges();
        });
      },
    });
  }

  checkIfCurrentUserAlreadyOffered(): void {
    if (!this.product || !this.currentUserId) {
      this.hasCurrentUserOffer = false;
      this.userOfferMessage = '';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.supportProductService.getOffersByPostId(this.product.id).subscribe({
      next: (offers: ArticleOfferResponse[]) => {
        const myOffer = offers.find(
          (offer) => offer.buyerUserId === this.currentUserId
        );

        this.hasCurrentUserOffer = !!myOffer;
        this.userOfferMessage = myOffer ? 'Oferta ya realizada' : '';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasCurrentUserOffer = false;
        this.userOfferMessage = '';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(product: SupportProductPostResponse): string | null {
    if (product.imageUrl) {
      return product.imageUrl;
    }

    if (product.imagePath) {
      if (product.imagePath.startsWith('http')) {
        return product.imagePath;
      }

      return `http://127.0.0.1:8081/${product.imagePath}`;
    }

    return null;
  }

  getOwnerFullName(): string {
    if (!this.product) {
      return 'Propietario no disponible';
    }

    const fullName = `${this.product.userName ?? ''} ${this.product.userLastName ?? ''}`.trim();
    return fullName || 'Propietario no disponible';
  }

  getGoogleMapsEmbedUrl(): SafeResourceUrl | null {
    if (
      this.product?.locationLat === null ||
      this.product?.locationLat === undefined ||
      this.product?.locationLng === null ||
      this.product?.locationLng === undefined
    ) {
      return null;
    }

    const url = `https://www.google.com/maps?q=${this.product.locationLat},${this.product.locationLng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getGoogleMapsLink(): string | null {
    if (
      this.product?.locationLat === null ||
      this.product?.locationLat === undefined ||
      this.product?.locationLng === null ||
      this.product?.locationLng === undefined
    ) {
      return null;
    }

    return `https://www.google.com/maps?q=${this.product.locationLat},${this.product.locationLng}`;
  }

  openImage(imageUrl: string | null): void {
    if (!imageUrl) return;
    this.selectedImage = imageUrl;
    this.isImageOpen = true;
  }

  closeImage(): void {
    this.isImageOpen = false;
    this.selectedImage = null;
  }

  openMap(): void {
    this.isMapOpen = true;
  }

  closeMap(): void {
    this.isMapOpen = false;
  }

  isOwner(): boolean {
    return !!this.product && !!this.currentUserId && this.product.userId === this.currentUserId;
  }

  isAvailableForOffers(): boolean {
  return !!this.product &&
    this.product.acceptsOffers === true &&
    (this.product.publicationState === 'ACTIVE' || this.product.publicationState === 'RESERVED');
  } 

  showUnavailableOfferMessage(): boolean {
    return !this.isOwner() && !this.canMakeOffer();
  }

  canMakeOffer(): boolean {
    return !!this.product &&
      !!this.currentUserId &&
      this.product.acceptsOffers === true &&
      (this.product.publicationState === 'ACTIVE' || this.product.publicationState === 'RESERVED') &&
      this.product.userId !== this.currentUserId &&
      !this.hasCurrentUserOffer;
  }

  canBuy(): boolean {
    return !!this.product &&
      !!this.currentUserId &&
      (this.product.publicationState === 'ACTIVE' || this.product.publicationState === 'RESERVED') &&
      this.product.userId !== this.currentUserId;
  }

  openOfferModal(): void {
    if (!this.canMakeOffer()) {
      return;
    }

    this.offerError = '';
    this.offerAmount = this.product?.salePrice ?? null;
    this.offerMessage = '';
    this.isOfferModalOpen = true;
  }

  closeOfferModal(): void {
    if (this.offerLoading) {
      return;
    }

    this.isOfferModalOpen = false;
  }

  clearOfferSuccessAfterDelay(): void {
    if (this.offerSuccessTimeout) {
      clearTimeout(this.offerSuccessTimeout);
    }

    this.offerSuccessTimeout = setTimeout(() => {
      this.offerSuccess = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  closeOfferSuccess(): void {
    this.offerSuccess = '';

    if (this.offerSuccessTimeout) {
      clearTimeout(this.offerSuccessTimeout);
      this.offerSuccessTimeout = null;
    }
  }

  buyProduct(): void {
    if (!this.canBuy()) {
      return;
    }

    this.isBuyModalOpen = true;
    this.paypalRendered = false;

    setTimeout(() => {
      this.renderPaypalButton();
    }, 100);
  }

  closeBuyModal(): void {
    this.isBuyModalOpen = false;
    this.paypalRendered = false;

    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  refreshProductAfterPayment(): void {
  setTimeout(() => {
    this.loadProduct();
    this.cdr.detectChanges();
  }, 1500);
  }

  submitOffer(): void {
    if (!this.product || !this.currentUserId) {
      this.offerError = 'No se pudo identificar al usuario.';
      return;
    }

    if (this.offerAmount === null || this.offerAmount === undefined || this.offerAmount <= 0) {
      this.offerError = 'Ingresá un monto válido.';
      return;
    }

    this.offerLoading = true;
    this.offerError = '';
    this.offerSuccess = '';

    this.supportProductService.createOffer({
      supportProductPostId: this.product.id,
      buyerUserId: this.currentUserId,
      amount: this.offerAmount,
      message: this.offerMessage.trim(),
    }).subscribe({
      next: (_response: ArticleOfferResponse) => {
        this.offerLoading = false;
        this.isOfferModalOpen = false;
        this.offerAmount = null;
        this.offerMessage = '';
        this.offerSuccess = '¡Oferta realizada con éxito! El vendedor ya puede verla.';
        this.hasCurrentUserOffer = true;
        this.userOfferMessage = 'Oferta ya realizada';
        this.clearOfferSuccessAfterDelay();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.offerLoading = false;
        this.offerError = err?.error?.message || err?.error || 'No se pudo enviar la oferta.';
        this.cdr.detectChanges();
      }
    });
  }

renderPaypalButton(): void {
  if (!this.product || this.paypalRendered) {
    return;
  }

  const container = document.getElementById('paypal-button-container');
  if (!container) {
    return;
  }

  container.innerHTML = '';

  paypal.Buttons({
    createOrder: async (_data: any, _actions: any) => {
      try {
        this.paymentSuccess = '';
        this.paymentError = '';

        const amount = Number(this.product!.salePrice).toFixed(2);
        console.log('Monto enviado a backend:', amount);

        const orderId = await this.supportProductService
          .createPaypalOrder(Number(amount))
          .toPromise();

        console.log('Order ID recibido del backend:', orderId);

        if (!orderId) {
          throw new Error('El backend no devolvió un orderId válido');
        }

        return orderId;
      } catch (error) {
        console.error('Error creando orden en backend:', error);
        this.paymentSuccess = '';
        this.paymentError = 'No se pudo crear la orden de PayPal.';
        this.cdr.detectChanges();
        throw error;
      }
    },

    onApprove: async (data: any, _actions: any) => {
      try {
        console.log('Order ID aprobado por PayPal:', data.orderID);

        const status = await this.supportProductService
          .capturePaypalOrder(data.orderID, this.product!.id)
          .toPromise();

        console.log('Status al capturar:', status);

        if (status === 'COMPLETED') {
          this.paymentError = '';
          this.paymentSuccess = '¡Pago completado con éxito! Tu compra fue confirmada correctamente.';
          this.closeBuyModal();
          this.cdr.detectChanges();

          this.refreshProductAfterPayment();

          setTimeout(() => {
            this.paymentSuccess = '';
            this.cdr.detectChanges();
          }, 5000);

          return;
        }

        this.paymentSuccess = '';
        this.paymentError = 'El pago no se completó correctamente.';
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error capturando orden en backend:', error);
        this.paymentSuccess = '';
        this.paymentError = 'No se pudo capturar el pago.';
        this.cdr.detectChanges();
        throw error;
      }
    },

    onError: (err: any) => {
      console.error('Error PayPal SDK:', err);
      this.paymentSuccess = '';
      this.paymentError = 'Ocurrió un error durante el pago.';
      this.cdr.detectChanges();
    }
  }).render('#paypal-button-container');

  this.paypalRendered = true;
}


}