import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http        = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl     = `${environment.apiUrl}/profiles`;

  favoriteIds  = signal<Set<number>>(new Set());
  // Guarda el profileId real (senior_profile_id o client_profile_id)
  private realProfileId = signal<number>(0);

  private get role(): string {
    return (this.authService.getUserRole() ?? '').toUpperCase().trim();
  }

  private get userId(): number {
    return Number(this.authService.getUserId() ?? '0');
  }

  get canUseFavorites(): boolean {
    return this.role === 'CLIENT' || this.role === 'SENIOR';
  }

  // ── Resuelve el profileId real consultando el backend ─────────
  private resolveProfileId(): Observable<number> {
    // Si ya lo tenemos cacheado, lo devolvemos directo
    if (this.realProfileId() > 0) {
      return of(this.realProfileId());
    }

    const endpoint = this.role === 'SENIOR'
      ? `${this.baseUrl}/senior/by-user/${this.userId}`
      : `${this.baseUrl}/client/by-user/${this.userId}`;

    return this.http.get<any>(endpoint).pipe(
      tap((profile) => this.realProfileId.set(Number(profile.id))),
      switchMap((profile) => of(Number(profile.id)))
    );
  }

  private listUrl(profileId: number): string {
    return this.role === 'SENIOR'
      ? `${this.baseUrl}/senior/${profileId}/favorites/ids`
      : `${this.baseUrl}/client/${profileId}/favorites`;
  }

  private actionUrl(profileId: number, providerProfileId: number): string {
    return this.role === 'SENIOR'
      ? `${this.baseUrl}/senior/${profileId}/favorites/${providerProfileId}`
      : `${this.baseUrl}/client/${profileId}/favorites/${providerProfileId}`;
  }

  // ── Cargar favoritos ──────────────────────────────────────────
  loadFavorites(): void {
    if (!this.canUseFavorites || !this.userId) return;

    this.resolveProfileId().pipe(
      switchMap((profileId) =>
        this.http.get<number[]>(this.listUrl(profileId))
      )
    ).subscribe({
      next: (ids) => this.favoriteIds.set(new Set(ids)),
      error: ()   => console.warn('No se pudieron cargar los favoritos')
    });
  }

  isFavorite(providerProfileId: number): boolean {
    return this.favoriteIds().has(providerProfileId);
  }

  addFavorite(providerProfileId: number): Observable<any> {
    return this.resolveProfileId().pipe(
      switchMap((profileId) =>
        this.http.post(this.actionUrl(profileId, providerProfileId), {})
      ),
      tap(() => this.updateSignal('add', providerProfileId)),
      catchError((err) => {
        if (err.status === 409) {
          this.updateSignal('add', providerProfileId);
          return of({ message: 'Ya estaba en favoritos' });
        }
        throw err;
      })
    );
  }

  removeFavorite(providerProfileId: number): Observable<any> {
    return this.resolveProfileId().pipe(
      switchMap((profileId) =>
        this.http.delete(this.actionUrl(profileId, providerProfileId))
      ),
      tap(() => this.updateSignal('remove', providerProfileId)),
      catchError((err) => {
        if (err.status === 404) {
          this.updateSignal('remove', providerProfileId);
          return of({ message: 'No estaba en favoritos' });
        }
        throw err;
      })
    );
  }

  toggleFavorite(providerProfileId: number): Observable<any> {
    return this.isFavorite(providerProfileId)
      ? this.removeFavorite(providerProfileId)
      : this.addFavorite(providerProfileId);
  }

  clearFavorites(): void {
    this.favoriteIds.set(new Set());
    this.realProfileId.set(0); // limpia caché al cerrar sesión
  }

  private updateSignal(action: 'add' | 'remove', id: number): void {
    const updated = new Set(this.favoriteIds());
    action === 'add' ? updated.add(id) : updated.delete(id);
    this.favoriteIds.set(updated);
  }
}