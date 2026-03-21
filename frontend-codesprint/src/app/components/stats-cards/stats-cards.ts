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

  adminStats = [
    { icon: 'heroUsers',          value: '1247',     label: 'Usuarios totales',        color: 'emerald' },
    { icon: 'heroClock',          value: '8',         label: 'Proveedores pendientes',  color: 'orange'  },
    { icon: 'heroCurrencyDollar', value: '₡4580K',   label: 'Ingresos este mes',       color: 'emerald' },
    { icon: 'heroChartBar',       value: '892',       label: 'Servicios completados',   color: 'blue'    },
  ];

  get stats() {
    const admin = [
      { icon: 'heroUsers',          value: '1247',                          label: 'Usuarios totales',        color: 'emerald' },
      { icon: 'heroClock',          value: this.pendingCount.toString(),     label: 'Proveedores pendientes',  color: 'orange'  },
      { icon: 'heroCurrencyDollar', value: '₡4580K',                        label: 'Ingresos este mes',       color: 'emerald' },
      { icon: 'heroChartBar',       value: '892',                            label: 'Servicios completados',   color: 'blue'    },
    ];

    const provider = [
      { icon: 'heroDocument',       value: '8',                                    label: 'Servicios activos',       color: 'emerald' },
      { icon: 'heroInbox',          value: this.providerPendingCount.toString(),    label: 'Solicitudes pendientes',  color: 'orange'  },
      { icon: 'heroCurrencyDollar', value: '₡125 000',                             label: 'Ganancias este mes',      color: 'emerald' },
      { icon: 'heroChartBar',       value: '127',                                   label: 'Servicios completados',   color: 'blue'    },
    ];

    return this.role === 'admin' ? admin : provider;
  }
}