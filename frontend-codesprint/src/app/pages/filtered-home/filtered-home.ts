import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { MapViewerComponent } from '../../components/mapviewer/map-viewer.component';
import { AuthService } from '../../services/auth.service';
import { MapService } from '../../services/map.services';
import { environment } from '../../../environments/environment';
import {
  EstadoReserva,
  FilteredHomeBackendItem,
  Marcador,
  PermisoCategoria,
  Reserva,
} from '../../interfaces/filtered-home/filtered-home.interface';
import { MapMarker, MapLayer } from '../../interfaces/filtered-home/map-marker';

// ── Tipos locales ─────────────────────────────────────────────────────────────
type RoleNavbar = 'client' | 'admin' | 'provider' | null;

// ── Constantes de mapeo ───────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  Seguridad:     '🛡️',
  Emergencia:    '🚨',
  Accesibilidad: '♿',
  Rutina:        '📋',
  Medicamentos:  '💊',
  Llaves:        '🗝️',
};

const CATEGORY_LAYER_MAP: Record<string, string> = {
  Seguridad:     'seguridad',
  Emergencia:    'seguridad',
  Accesibilidad: 'accesibilidad',
  Rutina:        'rutina',
  Medicamentos:  'medicamentos',
  Llaves:        'llaves',
};

const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  Seguridad:     'bg-red-900/60 text-red-100',
  Emergencia:    'bg-orange-900/60 text-orange-100',
  Accesibilidad: 'bg-blue-900/60 text-blue-100',
  Rutina:        'bg-teal-900/60 text-teal-100',
  Medicamentos:  'bg-green-900/60 text-green-100',
  Llaves:        'bg-yellow-900/60 text-yellow-100',
};

// ── Componente ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-filtered-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MapViewerComponent],
  templateUrl: './filtered-home.html',
})
export class FilteredHome implements OnInit {

  private readonly authService = inject(AuthService, { optional: true });
  private readonly location    = inject(Location, { optional: true });
  private readonly route       = inject(ActivatedRoute);
  private readonly cdr         = inject(ChangeDetectorRef);
  private readonly mapService  = inject(MapService);

  // ── Navbar ────────────────────────────────────────────────────────────────
  roleNavbar: RoleNavbar = null;

  // ── Reserva ───────────────────────────────────────────────────────────────
  reserva: Reserva | null = null;
  reservaIdInput = 0;

  // ── Estados de carga ──────────────────────────────────────────────────────
  cargandoReserva = false;
  accesoConcedido = false;
  mensajeEstado   = '';

  // ── Permisos ──────────────────────────────────────────────────────────────
  permisosReservaBase:  PermisoCategoria[] = [];
  permisosActivos:      PermisoCategoria[] = [];
  categoriasBloqueadas: PermisoCategoria[] = [];
  categoriasFiltrables: string[]           = [];

  // ── Marcadores (datos del backend) ────────────────────────────────────────
  private marcadores: Marcador[] = [];
  marcadoresVisibles: Marcador[] = [];
  categoriaSeleccionada = 'Todas';

  // ── Mapa interactivo ──────────────────────────────────────────────────────
  mapMarkers: MapMarker[]    = [];
  activeMapLayers: string[]  = [];
  selectedMapMarker: MapMarker | null = null;

  mapLayers: MapLayer[] = [
    {
      id: 'seguridad',
      name: 'Seguridad',
      icon: 'fa-solid fa-shield',
      color: 'bg-red-600',
      textColor: 'text-red-600',
      borderColor: 'border-red-600',
      description: 'Puntos de seguridad y emergencia',
    },
    {
      id: 'accesibilidad',
      name: 'Accesibilidad',
      icon: 'fa-solid fa-wheelchair',
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-600',
      description: 'Puntos accesibles',
    },
    {
      id: 'rutina',
      name: 'Rutina',
      icon: 'fa-solid fa-clock',
      color: 'bg-teal-600',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-600',
      description: 'Actividades de rutina diaria',
    },
    {
      id: 'medicamentos',
      name: 'Medicamentos',
      icon: 'fa-solid fa-pills',
      color: 'bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-600',
      description: 'Medicamentos y farmacia',
    },
    {
      id: 'llaves',
      name: 'Llaves',
      icon: 'fa-solid fa-key',
      color: 'bg-yellow-600',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-600',
      description: 'Accesos y llaves del hogar',
    },
  ];

  // ── Categorías base conocidas ─────────────────────────────────────────────
  private readonly categoriasBase = [
    'Seguridad',
    'Emergencia',
    'Accesibilidad',
    'Rutina',
    'Medicamentos',
    'Llaves',
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.roleNavbar = this.resolveRole();

    this.reservaIdInput = Number(
      this.route.snapshot.queryParamMap.get('bookingId') ??
      this.route.snapshot.queryParamMap.get('reserva_id') ??
      this.route.snapshot.paramMap.get('id') ??
      0
    );

    if (!this.reservaIdInput) {
      this.mensajeEstado   = 'No se recibió un ID de reserva válido.';
      this.cargandoReserva = false;
      return;
    }

    this.cargarReserva();
  }

  // ── Carga de datos ────────────────────────────────────────────────────────

  private async cargarReserva(): Promise<void> {
    const providerProfileId = Number(localStorage.getItem('profile_id') ?? 0);

    if (!providerProfileId) {
      this.mensajeEstado = 'No se encontró el perfil del proveedor.';
      return;
    }

    this.cargandoReserva = true;

    const url = `${environment.apiUrl}/filtered-home/${this.reservaIdInput}?providerProfileId=${providerProfileId}`;
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        this.accesoConcedido = false;
        if (response.status === 403) {
          this.mensajeEstado = 'Acceso denegado para esta reserva.';
        } else if (response.status === 404) {
          this.mensajeEstado = 'Reserva no encontrada.';
        } else {
          this.mensajeEstado = `Error al cargar los datos (código ${response.status}).`;
        }
        return;
      }

      const data                               = await response.json();
      const items: FilteredHomeBackendItem[]   = Array.isArray(data) ? data : [];

      if (!items.length) {
        this.mensajeEstado   = 'No hay información compartida para esta reserva.';
        this.accesoConcedido = false;
        return;
      }

      this.buildReserva(items);
      this.buildMarcadores(items);
      this.buildPermissions();
      this.postCargaPermisos();

    } catch (err: unknown) {
      this.accesoConcedido = false;
      if (err instanceof Error && err.name === 'AbortError') {
        this.mensajeEstado = 'El servidor tardó demasiado en responder.';
      } else {
        this.mensajeEstado = 'No se pudo conectar con el servidor.';
      }
    } finally {
      clearTimeout(timeoutId);
      this.cargandoReserva = false;
      this.cdr.detectChanges();
    }
  }

  private buildReserva(items: FilteredHomeBackendItem[]): void {
    const first       = items[0];
    const estadoReserva = this.mapEstado(first.bookingStatus);
    const fechaReserva  = first.scheduledAt
      ? new Date(first.scheduledAt).toISOString()
      : new Date().toISOString();

    this.reserva = {
      id:          this.reservaIdInput,
      estado:      estadoReserva,
      cliente:     first.clientName  || 'Cliente',
      servicio:    first.serviceTitle || 'Servicio',
      fechaInicio: fechaReserva,
      fechaFin:    null,
    };
  }

  private buildMarcadores(items: FilteredHomeBackendItem[]): void {
    this.marcadores = items.map((item) => ({
      id:          item.markerId,
      reservaId:   item.bookingId,
      categoria:   item.category,
      nombre:      item.title,
      descripcion: item.description,
    }));
  }

  private buildPermissions(): void {
    const id     = this.reservaIdInput;
    const activas = new Set(this.marcadores.map((m) => m.categoria));

    this.permisosReservaBase = this.categoriasBase.map((categoria) => ({
      reservaId: id,
      categoria,
      activo:    activas.has(categoria),
      sensible:  categoria === 'Medicamentos' || categoria === 'Llaves',
    }));
  }

  private postCargaPermisos(): void {
    this.permisosActivos = this.permisosReservaBase.filter((p) => p.activo);

    this.categoriasBloqueadas = this.permisosReservaBase.filter(
      (p) => !this.permisosActivos.some((a) => a.categoria === p.categoria)
    );

    this.categoriasFiltrables = [
      'Todas',
      ...this.permisosReservaBase.map((p) => p.categoria),
    ];

    if (!this.permisosActivos.length) {
      this.mensajeEstado   = 'No hay información compartida para esta reserva.';
      this.accesoConcedido = false;
      return;
    }

    this.accesoConcedido = true;
    this.aplicarFiltro();
    this.buildMapMarkers();
  }

  // ── Mapa ──────────────────────────────────────────────────────────────────

  /**
   * Convierte los Marcador[] del backend al formato MapMarker[] que consume
   * MapViewerComponent. Intenta cargar posiciones guardadas; si no las hay,
   * distribuye los marcadores en una grilla determinista (sin Math.random).
   */
  private buildMapMarkers(): void {
    this.mapService.getPositions(this.reservaIdInput).subscribe({
      next: (positions) => {
        this.mapMarkers = this.marcadores.map((m, i) => {
          const saved = positions.find((p) => p.markerId === m.id);
          return this.toMapMarker(m, i, saved?.x, saved?.y);
        });
        this.setActiveMapLayers();
        this.cdr.detectChanges();
      },
      error: () => {
        // Sin posiciones guardadas → distribución en grilla
        this.mapMarkers = this.marcadores.map((m, i) =>
          this.toMapMarker(m, i)
        );
        this.setActiveMapLayers();
        this.cdr.detectChanges();
      },
    });
  }

  private toMapMarker(
    m: Marcador,
    index: number,
    savedX?: number,
    savedY?: number,
  ): MapMarker {
    const total = this.marcadores.length;
    return {
      id:          m.id,
      title:       m.nombre,
      description: m.descripcion,
      status:      'activo',
      layer:       CATEGORY_LAYER_MAP[m.categoria] ?? 'rutina',
      icon:        CATEGORY_ICONS[m.categoria]     ?? '📍',
      x:           savedX ?? this.gridX(index, total),
      y:           savedY ?? this.gridY(index, total),
      categoria:   m.categoria,
    };
  }

  /**
   * Distribución en grilla: columnas = ceil(sqrt(total)).
   * Produce posiciones deterministas sin aleatoriedad.
   */
  private gridX(index: number, total: number): number {
    const cols = Math.ceil(Math.sqrt(total));
    return 10 + (index % cols) * (80 / Math.max(cols - 1, 1));
  }

  private gridY(index: number, total: number): number {
    const cols = Math.ceil(Math.sqrt(total));
    const row  = Math.floor(index / cols);
    const rows = Math.ceil(total / cols);
    return 15 + row * (70 / Math.max(rows - 1, 1));
  }

  private setActiveMapLayers(): void {
    this.activeMapLayers = [...new Set(this.mapMarkers.map((m) => m.layer))];
  }

  onMapMarkerSelected(marker: MapMarker | null): void {
    this.selectedMapMarker = marker;
  }

  // ── Filtros de categoría ──────────────────────────────────────────────────

  private aplicarFiltro(): void {
    if (!this.reserva) return;

    let base = this.marcadores.filter((m) => m.reservaId === this.reserva!.id);

    if (this.categoriaSeleccionada !== 'Todas') {
      base = base.filter((m) => m.categoria === this.categoriaSeleccionada);
    }

    this.marcadoresVisibles = base;
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltro();
  }

  esCategoriaDeshabilitada(categoria: string): boolean {
    if (categoria === 'Todas') return false;
    return this.categoriasBloqueadas.some((c) => c.categoria === categoria);
  }

  contarMarcadoresPorCategoria(categoria: string): number {
    if (categoria === 'Todas') return this.marcadores.length;
    return this.marcadores.filter((m) => m.categoria === categoria).length;
  }

  // ── Helpers de presentación ───────────────────────────────────────────────

  getCategoryIcon(categoria: string): string {
    return CATEGORY_ICONS[categoria] ?? '📍';
  }

  getCategoryBadgeClass(categoria: string): string {
    return CATEGORY_BADGE_CLASSES[categoria] ?? 'bg-gray-900/60 text-gray-100';
  }

  // ── Computed getters ──────────────────────────────────────────────────────

  get reservaId(): string {
    return this.reserva ? `RES-${this.reserva.id}` : '';
  }

  get estadoEtiqueta(): string {
    if (!this.reserva) return '';
    const map: Record<EstadoReserva, string> = {
      EN_CURSO:   'En curso',
      COMPLETADA: 'Finalizada',
      ACEPTADA:   'Aceptada',
      PENDIENTE:  'Solicitada',
    };
    return map[this.reserva.estado] ?? 'Solicitada';
  }

  get estadoClase(): string {
    if (!this.reserva) return '';
    return this.reserva.estado === 'EN_CURSO' ? 'status-active' : 'status-neutral';
  }

  // ── Formateo de fechas ────────────────────────────────────────────────────

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CR', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    });
  }

  formatOptionalDate(date?: string | null): string {
    if (!date) return 'No registrada';
    return this.formatDate(date);
  }

  // ── Navegación ────────────────────────────────────────────────────────────

  goBack(): void {
    this.location?.back();
  }

  // ── Resolvers privados ────────────────────────────────────────────────────

  private resolveRole(): RoleNavbar {
    const role = (this.authService?.getUserRole() ?? '').toUpperCase();
    if (role === 'PROVIDER') return 'provider';
    if (role === 'ADMIN')    return 'admin';
    if (role)                return 'client';
    return null;
  }

  private mapEstado(value: string): EstadoReserva {
    const status = (value ?? '').toUpperCase();
    if (status === 'EN_CURSO')                      return 'EN_CURSO';
    if (status === 'COMPLETADA')                    return 'COMPLETADA';
    if (status === 'ACEPTADA' || status === 'CONFIRMED') return 'ACEPTADA';
    return 'PENDIENTE';
  }
}