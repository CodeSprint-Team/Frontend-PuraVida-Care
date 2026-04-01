import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass, heroAdjustmentsHorizontal, heroStar,
  heroMapPin, heroXMark, heroCheckBadge, heroShieldCheck,
  heroInformationCircle, heroHeart
} from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { ProviderSearchService } from '../services/provider-search';
import { FavoritesService } from '../../../services/favorite.services';
import {
  ProviderSearchResult, ProviderSearchFilters, EMPTY_FILTERS
} from '../models/ProviderSearchResult';

@Component({
  selector: 'app-explorar-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroMagnifyingGlass, heroAdjustmentsHorizontal, heroStar,
    heroMapPin, heroXMark, heroCheckBadge, heroShieldCheck,
    heroInformationCircle, heroHeart
  })],
  templateUrl: './explore-services.html',
  styleUrl: './explore-services.css',
})
export class ExplorarServiciosComponent implements OnInit {
  private searchService     = inject(ProviderSearchService);
  readonly favoritesService = inject(FavoritesService);
  private router            = inject(Router);
  private cdr               = inject(ChangeDetectorRef);

  providers: ProviderSearchResult[] = [];
  errorMessage = '';
  loaded       = false;
  showFilters  = false;

  searchQuery    = '';
  filters:       ProviderSearchFilters = { ...EMPTY_FILTERS };
  activeFilters: ProviderSearchFilters = { ...EMPTY_FILTERS };

  readonly provinces = [
    'San José', 'Alajuela', 'Cartago',
    'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'
  ];

  readonly categories = [
    'Enfermería', 'Fisioterapia', 'Acompañamiento',
    'Cuidado general', 'Transporte'
  ];

  readonly PRICE_MIN  = 5000;
  readonly PRICE_MAX  = 70000;
  readonly PRICE_STEP = 1000;
  sliderMin = 5000;
  sliderMax = 70000;
  priceMode: 'slider' | 'preset' = 'slider';

  readonly pricePresets = [
    { label: 'Hasta ₡13,000',           desc: 'Servicios económicos', min: 5000,  max: 13000 },
    { label: 'Entre ₡13,000 y ₡18,000', desc: 'Rango intermedio',    min: 13000, max: 18000 },
    { label: 'Más de ₡18,000',          desc: 'Servicios premium',   min: 18000, max: 70000 },
  ];
  selectedPreset = -1;

  ngOnInit(): void {
    this.favoritesService.loadFavorites();
    this.doSearch();
  }

  get canUseFavorites(): boolean {
    return this.favoritesService.canUseFavorites;
  }

  isFavorite(providerId: number): boolean {
    return this.favoritesService.isFavorite(providerId);
  }

  toggleFavorite(event: Event, providerId: number): void {
    event.stopPropagation();
    if (!this.canUseFavorites) return;
    this.favoritesService.toggleFavorite(providerId).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => console.error('Error al actualizar favorito:', err)
    });
  }

  doSearch(): void {
    this.loaded = false;
    this.errorMessage = '';
    const f: Partial<ProviderSearchFilters> = { ...this.activeFilters };
    if (this.searchQuery.trim()) f.name = this.searchQuery.trim();

    this.searchService.search(f).subscribe({
      next: (data) => { this.providers = data; this.loaded = true; this.cdr.detectChanges(); },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los proveedores.';
        this.loaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  onMinSlider(value: number): void {
    this.sliderMin      = Math.min(value, this.sliderMax - this.PRICE_STEP);
    this.selectedPreset = -1;
    this.priceMode      = 'slider';
  }

  onMaxSlider(value: number): void {
    this.sliderMax      = Math.max(value, this.sliderMin + this.PRICE_STEP);
    this.selectedPreset = -1;
    this.priceMode      = 'slider';
  }

  selectPreset(i: number): void {
    this.selectedPreset = this.selectedPreset === i ? -1 : i;
    if (this.selectedPreset >= 0) {
      this.sliderMin = this.pricePresets[i].min;
      this.sliderMax = this.pricePresets[i].max;
      this.priceMode = 'preset';
    }
  }

  get sliderFillLeft(): string {
    return ((this.sliderMin - this.PRICE_MIN) / (this.PRICE_MAX - this.PRICE_MIN) * 100) + '%';
  }

  get sliderFillWidth(): string {
    return ((this.sliderMax - this.sliderMin) / (this.PRICE_MAX - this.PRICE_MIN) * 100) + '%';
  }

  openFilters():  void { this.showFilters = true; }
  closeFilters(): void { this.showFilters = false; }

  applyFilters(): void {
    this.activeFilters = {
      ...this.filters,
      minPrice: String(this.sliderMin),
      maxPrice: String(this.sliderMax),
    };
    this.showFilters = false;
    this.doSearch();
  }

  clearFilters(): void {
    this.filters        = { ...EMPTY_FILTERS };
    this.activeFilters  = { ...EMPTY_FILTERS };
    this.sliderMin      = this.PRICE_MIN;
    this.sliderMax      = this.PRICE_MAX;
    this.selectedPreset = -1;
    this.showFilters    = false;
    this.doSearch();
  }

  removeFilter(key: keyof ProviderSearchFilters): void {
    if (key === 'minPrice' || key === 'maxPrice') {
      this.activeFilters.minPrice = '';
      this.activeFilters.maxPrice = '';
      this.filters.minPrice       = '';
      this.filters.maxPrice       = '';
      this.sliderMin              = this.PRICE_MIN;
      this.sliderMax              = this.PRICE_MAX;
      this.selectedPreset         = -1;
    } else if (key === 'verifiedOnly') {
      this.activeFilters.verifiedOnly = false;
      this.filters.verifiedOnly       = false;
    } else {
      (this.activeFilters as any)[key] = '';
      (this.filters as any)[key]       = '';
    }
    this.doSearch();
  }

  get activeFilterCount(): number {
    let c = 0;
    if (this.activeFilters.zone)                                   c++;
    if (this.activeFilters.minPrice || this.activeFilters.maxPrice) c++;
    if (this.activeFilters.minRating)                              c++;
    if (this.activeFilters.category)                               c++;
    if (this.activeFilters.verifiedOnly)                           c++;
    return c;
  }

  get priceChipLabel(): string {
    const lo = Number(this.activeFilters.minPrice);
    const hi = Number(this.activeFilters.maxPrice);
    if (!lo && !hi) return '';
    return `₡${lo.toLocaleString('es-CR')} – ₡${hi.toLocaleString('es-CR')}`;
  }

  goToProvider(id: number): void { this.router.navigate(['/proveedor', id]); }

  formatPrice(price: number | null, mode: string | null): string {
    if (!price) return 'Consultar';
    return `₡ ${price.toLocaleString('es-CR')}${mode === 'hourly' ? ' / hora' : ''}`;
  }

  formatColones(value: number): string {
    return '₡' + value.toLocaleString('es-CR');
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}