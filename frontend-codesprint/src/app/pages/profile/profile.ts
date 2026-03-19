import { Component, inject } from '@angular/core';
import { Router } from '@angular/router'; // Necesario para navegar
import { NavbarComponent } from '../../components/navbar/navbar'; // Ajusta la ruta a tu Navbar
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, CommonModule], // Navbar y CommonModule (para el *ngIf y *ngFor)
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private router = inject(Router);

  // Tus datos (esto se conectará a un servicio después)
  profileData = {
    elderName: 'María Pérez',
    elderAge: 82,
    elderGender: 'Femenino',
    servicesCompleted: 12,
    familyMember: 'Juan Pérez',
    relation: 'Hijo',
    phone: '2222-3333',
    email: 'juan@email.com',
    address: 'San José, Costa Rica',
    favoriteProviders: [
      { id: 1, name: 'Dr. Carlos Ruiz', services: 5, avatar: '👨‍⚕️' }
    ]
  };

  // Función que el botón del HTML llama
  navigateToEdit(): void {
    this.router.navigate(['/profile-edit']);
  }

  // Función para ver detalles del proveedor
  viewProvider(id: number): void {
    console.log('Ver proveedor:', id);
  }

  getYearsInPlatform(): number {
    return 2; 
  }
}