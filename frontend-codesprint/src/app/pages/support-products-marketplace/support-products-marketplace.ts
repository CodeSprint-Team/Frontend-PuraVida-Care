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
import { SupportProductCatalogService, SupportProductCatalogResponse } from '../../services/support-product/SupportProductCatalogService';

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
export class SupportProductsMarketplace implements OnInit {
  searchQuery = '';
  locationQuery = '';
  selectedCondition: 'all' | 'new' | 'used' = 'all';
  selectedCategory = 'all';
  acceptsOffersOnly = false;
  showFilters = false;
  sortBy: 'recent' | 'priceAsc' | 'priceDesc' = 'recent';

  priceRange = {
    min: 0,
    max: null as number | null,
  };

  loadingProducts = true;

  categories: SupportProductCatalogResponse[] = [];

  products: SupportProductPostResponse[] = [];

  constructor(
    private router: Router,
    private supportProductService: SupportProductService,
    private catalogService: SupportProductCatalogService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    this.catalogService.getAllActive().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  loadProducts(): void {
    this.loadingProducts = true;

    this.supportProductService.getAllPosts().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          console.log('Productos cargados:', data);
          console.log('Primera imagen:', data?.[0]?.imageUrl, data?.[0]?.imagePath);
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

  normalizeText(value: string | null | undefined): string {
    return (value ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  normalizeCondition(value: string | null | undefined): 'new' | 'used' | '' {
    const normalized = this.normalizeText(value);

    if (['new', 'nuevo', 'nueva'].includes(normalized)) {
      return 'new';
    }

    if (['used', 'usado', 'usada'].includes(normalized)) {
      return 'used';
    }

    return '';
  }

  get filteredProducts(): SupportProductPostResponse[] {
    let filtered = this.products.filter((product) => {

      const title = this.normalizeText(product.title);
      const categoryName = this.normalizeText(product.supportProductCatalogName);
      const locationText = this.normalizeText(product.locationText);
      const search = this.normalizeText(this.searchQuery);
      const locationSearch = this.normalizeText(this.locationQuery);

      const matchesSearch =
        !search ||
        title.includes(search) ||
        categoryName.includes(search);

      const productCondition = this.normalizeCondition(product.condition);

      const matchesCondition =
        this.selectedCondition === 'all' ||
        productCondition === this.selectedCondition;

      const matchesCategory =
        this.selectedCategory === 'all' ||
        categoryName === this.normalizeText(this.selectedCategory);

      const price = Number(product.salePrice) || 0;
      const minPrice = Number(this.priceRange.min) || 0;
      const maxPrice =
        this.priceRange.max === null || this.priceRange.max === undefined || this.priceRange.max === 0
          ? Number.MAX_SAFE_INTEGER
          : Number(this.priceRange.max);

      const matchesPrice =
        price >= minPrice &&
        price <= maxPrice;

      const matchesOffers =
        !this.acceptsOffersOnly || !!product.acceptsOffers;

      const matchesLocation =
        !locationSearch || locationText.includes(locationSearch);

      return (
        matchesSearch &&
        matchesCondition &&
        matchesCategory &&
        matchesPrice &&
        matchesOffers &&
        matchesLocation
      );
    });

    if (this.sortBy === 'priceAsc') {
      filtered = [...filtered].sort(
        (a, b) => (Number(a.salePrice) || 0) - (Number(b.salePrice) || 0)
      );
    } else if (this.sortBy === 'priceDesc') {
      filtered = [...filtered].sort(
        (a, b) => (Number(b.salePrice) || 0) - (Number(a.salePrice) || 0)
      );
    } else {
      filtered = [...filtered].sort(
        (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)
      );
    }

    return filtered;
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
    this.locationQuery = '';
    this.selectedCondition = 'all';
    this.selectedCategory = 'all';
    this.acceptsOffersOnly = false;
    this.sortBy = 'recent';
    this.priceRange = {
      min: 0,
      max: null,
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