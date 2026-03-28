import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroAdjustmentsHorizontal,
  heroPlus,
  heroMapPin,
  heroTag,
  heroBolt,
} from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../components/navbar/navbar';
import { SupportProductService } from '../../services/support-product/support-product';
import { SupportProductPostResponse } from '../../interfaces/support-product/support-product-response.interface';


@Component({
  selector: 'app-support-products-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      heroMagnifyingGlass,
      heroAdjustmentsHorizontal,
      heroPlus,
      heroMapPin,
      heroTag,
      heroBolt,
    }),
  ],
  templateUrl: './support-products-marketplace.html',
  styleUrl: './support-products-marketplace.css',
})
export class SupportProductsMarketplace implements OnInit{
  searchQuery = '';
  selectedCondition: 'all' | 'new' | 'used' = 'all';
  selectedCategory = 'all';
  acceptsOffersOnly = false;
  showFilters = false;

  priceRange = {
    min: 0,
    max: 500000,
  };

  loadingProducts = true;

  ngOnInit(): void {
  this.loadProducts();
}

loadProducts(): void {
  this.loadingProducts = true;

  this.supportProductService.getAllPosts().subscribe({
    next: (data) => {
      this.ngZone.run(() => {
        console.log('Productos cargados:', data);
        console.log('Primera imagen:', data[0]?.imageUrl, data[0]?.imagePath);
        this.products = data ?? [];
        this.loadingProducts = false;
        this.cdr.detectChanges();
      });
    },
    error: (error) => {
      this.ngZone.run(() => {
        console.error('Error al cargar productos:', error);
        this.products = [];
        this.loadingProducts = false;
        this.cdr.detectChanges();
      });
    }
  });
}
  categories: string[] = [
    'Movilidad',
    'Ayuda para el hogar',
    'Salud y monitoreo',
    'Rehabilitación',
    'Cuidado personal',
    'Tecnología asistiva',
    'Ortopedia',
    'Otros',
  ];

products: SupportProductPostResponse[] = []; 

constructor(
  private router: Router,
  private supportProductService: SupportProductService,
  private cdr: ChangeDetectorRef,
  private ngZone: NgZone
) {}

get filteredProducts(): SupportProductPostResponse[] {
  return this.products.filter((product) => {
    const matchesSearch =
  product.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
  (product.supportProductCatalogName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false);

    const productCondition = (product.condition || '').toLowerCase();

    const matchesCondition =
    this.selectedCondition === 'all' ||
    productCondition === this.selectedCondition;

    const matchesCategory =
      this.selectedCategory === 'all' ||
      product.supportProductCatalogName === this.selectedCategory;

    const matchesPrice =
      product.salePrice >= this.priceRange.min &&
      product.salePrice <= this.priceRange.max;

    const matchesOffers =
      !this.acceptsOffersOnly || product.acceptsOffers;

    return (
      matchesSearch &&
      matchesCondition &&
      matchesCategory &&
      matchesPrice &&
      matchesOffers
    );
  });
}

  toggleCondition(condition: 'new' | 'used'): void {
    this.selectedCondition =
      this.selectedCondition === condition ? 'all' : condition;
  }

  toggleOffers(): void {
    this.acceptsOffersOnly = !this.acceptsOffersOnly;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCondition = 'all';
    this.selectedCategory = 'all';
    this.acceptsOffersOnly = false;
    this.priceRange = {
      min: 0,
      max: 500000,
    };
  }

  goToPublish(): void {
    this.router.navigate(['/support-products/create']);
  }

  goToDetail(product: SupportProductPostResponse): void {
  this.router.navigate(['/support-products', product.id], {
    state: { product }
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



}