import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft, heroSparkles, heroMapPin,
  heroStar, heroCheckBadge, heroShieldCheck
} from '@ng-icons/heroicons/outline';
import { NavbarComponent } from '../../../components/navbar/navbar';
import { ProviderSearchService } from '../../explore/services/provider-search';
import { ProviderSearchResult } from '../../explore/models/ProviderSearchResult';

@Component({
  selector: 'app-resultados-recomendados',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NavbarComponent],
  viewProviders: [provideIcons({
    heroArrowLeft, heroSparkles, heroMapPin,
    heroStar, heroCheckBadge, heroShieldCheck
  })],
  templateUrl: './resultadosrecomendados.html',
  styleUrl: './resultadosrecomendados.css',
})
export class ResultadosRecomendadosComponent implements OnInit {
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);
  private searchService = inject(ProviderSearchService);
  private cdr           = inject(ChangeDetectorRef);

  category     = '';
  zone         = '';
  service      = '';
  providers:   ProviderSearchResult[] = [];
  loaded       = false;
  errorMessage = '';

  ngOnInit(): void {
    this.category = this.route.snapshot.queryParamMap.get('category') ?? '';
    this.zone     = this.route.snapshot.queryParamMap.get('zone')     ?? '';
    this.service  = this.route.snapshot.queryParamMap.get('service')  ?? '';
    this.loadProviders();
  }

  loadProviders(): void {
    this.searchService.search({
      category: this.category,
      zone:     this.zone,
    }).subscribe({
      next: (data) => {
        this.providers = data;
        this.loaded    = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los proveedores.';
        this.loaded       = true;
        this.cdr.detectChanges();
      }
    });
  }

  goToProvider(id: number): void {
    this.router.navigate(['/proveedor', id]);
  }

  goBack(): void {
    this.router.navigate(['/chat-ia']);
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  formatPrice(price: number | null, mode: string | null): string {
    if (!price) return 'Consultar';
    return `₡ ${price.toLocaleString('es-CR')}${mode === 'hourly' ? ' / hora' : ''}`;
  }
}