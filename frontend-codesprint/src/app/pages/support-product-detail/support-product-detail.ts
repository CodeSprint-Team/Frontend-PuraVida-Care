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
  offerAmount: number | null = null;
  offerMessage = '';
  offerLoading = false;
  offerError = '';
  offerSuccess = '';

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
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.product = null;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
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

  canMakeOffer(): boolean {
    return !!this.product &&
      !!this.currentUserId &&
      this.product.acceptsOffers === true &&
      this.product.publicationState === 'ACTIVE' &&
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
}