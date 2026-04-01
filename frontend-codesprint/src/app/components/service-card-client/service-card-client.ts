import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceCard } from '../../interfaces/client/service-card-client.interface';

@Component({
  selector: 'app-service-card-client',
  imports: [],
  templateUrl: './service-card-client.html',
  styleUrl: './service-card-client.css',
  standalone: true
})
export class ServiceCardClient {
  @Input() service!: ServiceCard;

  constructor(private router: Router) {}

  goToDetail() {
    this.router.navigate(['/detalle-cita-cliente', this.service.id]);
  }
}
