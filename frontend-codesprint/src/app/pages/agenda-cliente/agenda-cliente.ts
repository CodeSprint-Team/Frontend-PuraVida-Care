import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { ServiceCardClient } from '../../components/service-card-client/service-card-client';
import { NavbarComponent } from '../../components/navbar/navbar';
import { ServiceCard } from '../../interfaces/client/service-card-client.interface';
import { AgendaBookingResponseDTO } from '../../interfaces/client/agenda-booking.interface';
import { AgendaClienteService } from '../../services/agenda-cliente/agenda-cliente.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-agenda-cliente',
  imports: [RouterLink, ServiceCardClient, NavbarComponent],
  templateUrl: './agenda-cliente.html',
  styleUrl: './agenda-cliente.css',
  standalone: true
})
export class AgendaCliente implements OnInit {
  private readonly agendaService = inject(AgendaClienteService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = true;
  errorMessage = '';
  totalServicios = 0;

  proximosServicios: ServiceCard[] = [];
  historial: ServiceCard[] = [];

  ngOnInit(): void {
    this.loadAgenda();
  }

  private loadAgenda(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.loading = false;
      this.errorMessage = 'Necesitas iniciar sesión para ver tu agenda.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.agendaService.getAgendaByUserId(userId).pipe(
      timeout(10000)
    ).subscribe({
      next: (bookings) => {
        this.totalServicios = bookings.length;
        const cards = bookings
          .map((booking) => this.safeMapToCard(booking))
          .filter((card): card is ServiceCard => card !== null);
        this.proximosServicios = cards.filter((card) => !card.isHistory);
        this.historial = cards.filter((card) => !!card.isHistory);
        if (cards.length === 0 && bookings.length > 0) {
          this.errorMessage = 'Las citas llegaron pero no se pudieron mostrar.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('agenda error', err);
        this.loading = false;
        this.errorMessage = 'No se pudo cargar la agenda. Intenta más tarde.';
        this.cdr.detectChanges();
      }
    });
  }

  private safeMapToCard(booking: AgendaBookingResponseDTO): ServiceCard | null {
    try {
      return this.mapToCard(booking);
    } catch (e) {
      console.error('Booking inválido', booking, e);
      return null;
    }
  }

  private mapToCard(booking: AgendaBookingResponseDTO): ServiceCard {
    const scheduledDate = this.parseBackendDate(booking.scheduledAt);
    const labelStatus = this.toUiStatus(booking.bookingStatus, scheduledDate);
    const isHistory =
      labelStatus === 'Completado' ||
      labelStatus === 'Cancelado' ||
      scheduledDate < new Date();

    return {
      id: String(booking.bookingId),
      emoji: this.getEmojiByCategory(booking.categoryName),
      title: booking.serviceTitle,
      subtitle: booking.categoryName || booking.serviceDescription || 'Servicio',
      providerName: booking.providerFullName,
      date: this.formatDateShort(scheduledDate),
      time: this.formatTime(scheduledDate),
      location: this.formatLocation(booking),
      status: labelStatus,
      price: this.formatCurrency(booking.agreedPrice),
      isHistory,
      historyDate: `${this.formatDateNumeric(scheduledDate)} - ${this.formatTime(scheduledDate)}`
    };
  }

  private toUiStatus(rawStatus: string, scheduledDate: Date): 'Programado' | 'Hoy' | 'Completado' | 'Cancelado' {
    const normalized = rawStatus?.toUpperCase() ?? '';
    if (normalized === 'COMPLETADO') return 'Completado';
    if (normalized === 'CANCELADO') return 'Cancelado';
    if (this.isToday(scheduledDate)) return 'Hoy';
    return 'Programado';
  }

  private getEmojiByCategory(category: string): string {
    const normalized = (category || '').toLowerCase();
    if (normalized.includes('transporte')) return 'TR';
    if (normalized.includes('enfermer')) return 'ENF';
    if (normalized.includes('compan')) return 'AC';
    return 'SVC';
  }

  private formatDateShort(date: Date): string {
    return date.toLocaleDateString('es-CR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  }

  private formatDateNumeric(date: Date): string {
    return date.toLocaleDateString('es-CR');
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private formatCurrency(value: number | string): string {
    const amount = Number(value);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0
    }).format(safeAmount);
  }

  private formatLocation(booking: AgendaBookingResponseDTO): string {
    if (booking.seniorAddress?.trim()) return booking.seniorAddress;
    const hasCoordinates =
      booking.destinationLatitude !== null &&
      booking.destinationLongitude !== null;
    return hasCoordinates ? 'Destino registrado en mapa' : 'Ubicación por confirmar';
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private parseBackendDate(value: string): Date {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const normalized = value.replace(/(\.\d{3})\d+/, '$1');
    const fallback = new Date(normalized);
    if (!Number.isNaN(fallback.getTime())) return fallback;
    return new Date();
  }

  private getCurrentUserId(): number | null {
    const userId = this.authService.getUserId();
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
