import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  EstadoReserva,
  FilteredHomeBackendItem,
  Marcador,
  PermisoCategoria,
  Reserva,
} from '../../interfaces/filtered-home/filtered-home.interface';

type RoleNavbar = 'client' | 'admin' | 'provider' | null;

@Component({
  selector: 'app-filtered-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './filtered-home.html',
})
export class FilteredHome implements OnInit {

  private readonly authService         = inject(AuthService, { optional: true });
  private readonly location            = inject(Location, { optional: true });
  private readonly route               = inject(ActivatedRoute);
  private readonly cdr                 = inject(ChangeDetectorRef);

  roleNavbar: RoleNavbar = null;
  reserva: Reserva | null = null;
  reservaIdInput = 0;

  cargandoReserva = false;
  accesoConcedido = false;
  mensajeEstado   = '';

  permisosReservaBase:  PermisoCategoria[] = [];
  permisosActivos:      PermisoCategoria[] = [];
  categoriasBloqueadas: PermisoCategoria[] = [];
  categoriasFiltrables: string[]           = [];
  marcadoresVisibles:   Marcador[]         = [];

  categoriaSeleccionada = 'Todas';
  private readonly categoriasBase = [
    'Seguridad',
    'Emergencia',
    'Accesibilidad',
    'Rutina',
    'Medicamentos',
    'Llaves',
  ];
  private marcadores: Marcador[] = [];

  ngOnInit(): void {
    this.roleNavbar = this.resolveRole();

    this.reservaIdInput = Number(
      this.route.snapshot.queryParamMap.get('bookingId') ??
      this.route.snapshot.queryParamMap.get('reserva_id') ??
      this.route.snapshot.paramMap.get('id') ??
      0
    );

    console.log('bookingId recibido:', this.reservaIdInput);

    if (this.reservaIdInput === 0) {
      this.mensajeEstado = 'No se recibió bookingId';
      this.cargandoReserva = false;
      return;
    }

    this.cargarReserva();
  }

  goBack(): void { this.location?.back(); }

  private async cargarReserva(): Promise<void> {
    if (!this.reservaIdInput) {
      this.mensajeEstado = 'No se recibió bookingId';
      return;
    }

    const providerProfileId = Number(localStorage.getItem('profile_id') ?? 0);

    if (!providerProfileId) {
      this.mensajeEstado = 'No se encontró el perfil del proveedor';
      return;
    }

    this.cargandoReserva = true;
    const url = `${environment.apiUrl}/filtered-home/${this.reservaIdInput}?providerProfileId=${providerProfileId}`;
    console.log('Llamando filtered-home URL:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        if (response.status === 403) this.mensajeEstado = 'Acceso denegado';
        else if (response.status === 404) this.mensajeEstado = 'Reserva no encontrada';
        else this.mensajeEstado = `Error al cargar el hogar filtrado (código ${response.status})`;
        this.accesoConcedido = false;
        return;
      }

      const data = await response.json();
      const items: FilteredHomeBackendItem[] = Array.isArray(data) ? data : [];

      if (!items.length) {
        this.mensajeEstado = 'No hay información compartida';
        this.accesoConcedido = false;
        return;
      }

      const estadoReserva = this.mapEstado(items[0].bookingStatus);
      const fechaReserva = items[0].scheduledAt
        ? new Date(items[0].scheduledAt).toISOString()
        : new Date().toISOString();
      this.reserva = {
        id: this.reservaIdInput,
        estado: estadoReserva,
        cliente: items[0].clientName || 'Cliente',
        servicio: items[0].serviceTitle || 'Servicio',
        fechaInicio: fechaReserva,
        fechaFin: null,
      };

      this.marcadores = items.map((item) => ({
        id: item.markerId,
        reservaId: item.bookingId,
        categoria: item.category,
        nombre: item.title,
        descripcion: item.description,
      }));

      this.permisosReservaBase = this.mapPermissionsFromMarkers(this.marcadores);
      this.postCargaPermisos();
      console.log('Marcadores recibidos:', this.marcadores.length);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        this.mensajeEstado = 'El servidor tardó demasiado en responder.';
      } else {
        this.mensajeEstado = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      }
      this.accesoConcedido = false;
    } finally {
      clearTimeout(timeoutId);
      this.cargandoReserva = false;
      this.cdr.detectChanges();
    }
  }

  private mapPermissionsFromMarkers(marcadores: Marcador[]): PermisoCategoria[] {
    const id = this.reservaIdInput;
    const activas = new Set(marcadores.map((m) => m.categoria));
    return this.categoriasBase.map((categoria) => ({
      reservaId: id,
      categoria,
      activo: activas.has(categoria),
      sensible: categoria === 'Medicamentos' || categoria === 'Llaves',
    }));
  }

  private postCargaPermisos(): void {
    this.permisosActivos = this.permisosReservaBase.filter((p) => p.activo);

    this.categoriasBloqueadas = this.permisosReservaBase.filter(
      p => !this.permisosActivos.some(a => a.categoria === p.categoria)
    );

    this.categoriasFiltrables = [
      'Todas',
      ...this.permisosReservaBase.map(p => p.categoria),
    ];

    if (!this.permisosActivos.length) {
      this.mensajeEstado = 'No hay información compartida';
      this.accesoConcedido = false;
      return;
    }

    this.accesoConcedido = true;
    this.aplicarFiltro();
  }

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
    return this.categoriasBloqueadas.some(c => c.categoria === categoria);
  }

  contarMarcadoresPorCategoria(categoria: string): number {
    if (categoria === 'Todas') return this.marcadores.length;
    return this.marcadores.filter((m) => m.categoria === categoria).length;
  }

  get reservaId(): string {
    return this.reserva ? `RES-${this.reserva.id}` : '';
  }

  get estadoEtiqueta(): string {
    if (!this.reserva) return '';
    if (this.reserva.estado === 'EN_CURSO') return 'En curso';
    if (this.reserva.estado === 'COMPLETADA') return 'Finalizada';
    if (this.reserva.estado === 'ACEPTADA') return 'Aceptada';
    return 'Solicitada';
  }

  get estadoClase(): string {
    if (!this.reserva) return '';
    return this.reserva.estado === 'EN_CURSO'
      ? 'status-active'
      : 'status-neutral';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CR');
  }

  formatOptionalDate(date?: string | null): string {
    if (!date) return 'No registrada';
    return this.formatDate(date);
  }

  private resolveRole(): RoleNavbar {
    const role = (this.authService?.getUserRole() ?? '').toUpperCase();
    if (role === 'PROVIDER') return 'provider';
    if (role === 'ADMIN') return 'admin';
    if (role) return 'client';
    return null;
  }

  private mapEstado(value: string): EstadoReserva {
    const status = (value ?? '').toUpperCase();
    if (status === 'EN_CURSO') return 'EN_CURSO';
    if (status === 'COMPLETADA') return 'COMPLETADA';
    if (status === 'ACEPTADA' || status === 'CONFIRMED') return 'ACEPTADA';
    return 'PENDIENTE';
  }
}
