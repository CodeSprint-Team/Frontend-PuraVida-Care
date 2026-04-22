import { Component, signal, computed, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceCardClient } from '../../components/service-card-client/service-card-client';
import { ServiceCard } from '../../interfaces/client/service-card-client.interface';
import { NavbarComponent } from '../../components/navbar/navbar';
import { AgendaClienteService } from '../../services/agenda-cliente/agenda-cliente.service';
import { AgendaBookingResponseDTO } from '../../interfaces/client/agenda-booking.interface';
import { AuthService } from '../../services/auth.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-calendario-cliente',
  imports: [RouterLink, ServiceCardClient, NavbarComponent],
  templateUrl: './calendario-cliente.html',
  styleUrl: './calendario-cliente.css',
  standalone: true
})
export class CalendarioCliente implements OnInit {
  private readonly agendaService = inject(AgendaClienteService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = true;
  errorMessage = '';
  appointmentDates: Date[] = [];

  today = new Date();
  currentYear = signal(this.today.getFullYear());
  currentMonth = signal(this.today.getMonth());
  monthName = computed(() =>
    new Date(this.currentYear(), this.currentMonth(), 1).toLocaleDateString('es-CR', {
      month: 'long',
      year: 'numeric'
    })
  );
  weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  proximosServicios: ServiceCard[] = [];
  historial: ServiceCard[] = [];

  calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number | null }[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d });
    return days;
  });

  ngOnInit(): void {
    this.loadAgenda();
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    return (
      day === this.today.getDate() &&
      this.currentMonth() === this.today.getMonth() &&
      this.currentYear() === this.today.getFullYear()
    );
  }

  hasCita(day: number | null): boolean {
    if (!day) return false;
    return this.appointmentDates.some((date) => {
      return (
        date.getDate() === day &&
        date.getMonth() === this.currentMonth() &&
        date.getFullYear() === this.currentYear()
      );
    });
  }

  private loadAgenda(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.loading = false;
      this.errorMessage = 'Necesitas iniciar sesión.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.agendaService.getAgendaByUserId(userId).pipe(
      timeout(10000)
    ).subscribe({
      next: (bookings) => {
        const cards = bookings
          .map((booking) => this.safeMapToCard(booking))
          .filter((card): card is ServiceCard => card !== null);
        this.proximosServicios = cards.filter((card) => !card.isHistory);
        this.historial = cards.filter((card) => !!card.isHistory);
        this.appointmentDates = bookings.map((booking) => this.parseBackendDate(booking.scheduledAt));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('calendario error', err);
        this.loading = false;
        this.errorMessage = 'No se pudo cargar el calendario.';
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
      location: booking.seniorAddress || 'Ubicación por confirmar',
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
    if (this.isTodayDate(scheduledDate)) return 'Hoy';
    return 'Programado';
  }

  private isTodayDate(date: Date): boolean {
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
    return Number.isFinite(amount)
      ? new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(amount)
      : new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(0);
  }

  private getEmojiByCategory(category: string): string {
    const normalized = (category || '').toLowerCase();
    if (normalized.includes('transporte')) return 'TR';
    if (normalized.includes('enfermer')) return 'ENF';
    if (normalized.includes('compan')) return 'AC';
    return 'SVC';
  }

  private getCurrentUserId(): number | null {
    const userId = this.authService.getUserId();
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
