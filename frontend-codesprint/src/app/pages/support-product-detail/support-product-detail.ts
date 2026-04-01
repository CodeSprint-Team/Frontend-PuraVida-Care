import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

@Component({
  selector: 'app-support-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NgIconComponent],
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

  constructor(
    private route: ActivatedRoute,
    private supportProductService: SupportProductService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
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
      error: (error) => {
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
    if (!this.product?.locationLat || !this.product?.locationLng) {
      return null;
    }

    const url = `https://www.google.com/maps?q=${this.product.locationLat},${this.product.locationLng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getGoogleMapsLink(): string | null {
    if (!this.product?.locationLat || !this.product?.locationLng) {
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
}