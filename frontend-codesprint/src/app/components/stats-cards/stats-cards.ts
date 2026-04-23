import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUsers,
  heroClock,
  heroCurrencyDollar,
  heroChartBar,
  heroDocument,
  heroInbox
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({ heroUsers, heroClock, heroCurrencyDollar, heroChartBar, heroDocument, heroInbox })
  ],
  templateUrl: './stats-cards.html'
})
export class StatsCards {
  @Input() role: 'admin' | 'provider' = 'admin';
  @Input() pendingCount: number = 0;
  @Input() providerPendingCount: number = 0;
  @Input() providerTotalCount: number = 0;
  @Input() providerAcceptedCount: number = 0;

  get stats() {
    const admin = [
      { icon: 'heroUsers',          value: '1247',                          label: 'Usuarios totales',        color: 'emerald' },
      { icon: 'heroClock',          value: this.pendingCount.toString(),     label: 'Proveedores pendientes',  color: 'orange'  },
      { icon: 'heroCurrencyDollar', value: '₡4580K',                        label: 'Ingresos este mes',       color: 'emerald' },
      { icon: 'heroChartBar',       value: '892',                            label: 'Servicios completados',   color: 'blue'    },
    ];

    const provider = [
      { icon: 'heroDocument',       value: this.providerTotalCount.toString(),    label: 'Solicitudes totales',     color: 'blue'    },
      { icon: 'heroInbox',          value: this.providerPendingCount.toString(),  label: 'Solicitudes pendientes',  color: 'orange'  },
      { icon: 'heroChartBar',       value: this.providerAcceptedCount.toString(), label: 'Solicitudes aceptadas',   color: 'emerald' },
    ];

    return this.role === 'admin' ? admin : provider;
  }
}
