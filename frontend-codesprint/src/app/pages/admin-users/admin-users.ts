import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserStatus } from '../../services/admin';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroUser, heroArrowLeft} from '@ng-icons/heroicons/outline';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import {NavbarComponent} from '../../components/navbar/navbar';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent,NgIconComponent],
  viewProviders: [provideIcons({ heroUser, heroArrowLeft, })],
  templateUrl: './admin-users.html',
})
export class AdminUsers implements OnInit {
  role: 'admin' | 'provider' = 'admin';
  users: UserStatus[] = [];
  selectedUser: UserStatus | null = null;


  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(selectUserId?: number): void {
    this.adminService.getAllUsers().subscribe({
      next: (data: UserStatus[]) => {
        this.users = [...data];
        if (selectUserId) {
          this.selectedUser = data.find(u => u.userId === selectUserId) || data[0];
        } else {
          this.selectedUser = data.length > 0 ? data[0] : null;
        }
        this.cdr.detectChanges();
      },
      error: (err: Error) => console.error('ERROR:', err)
    });
  }

  selectUser(user: UserStatus): void {
    this.selectedUser = user;
    this.cdr.detectChanges();
  }

  activateUser(): void {
    if (!this.selectedUser) return;
    Swal.fire({
      title: '¿Activar usuario?',
      text: `${this.selectedUser.fullName} podrá iniciar sesión nuevamente.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed || !this.selectedUser) return;
      const userId = this.selectedUser.userId;
      this.adminService.reviewUser(userId, { action: 'activate' }).subscribe({
        next: (updated) => {
          Swal.fire({ title: '¡Activado!', text: `${updated.fullName} ha sido activado.`, icon: 'success', timer: 2000, showConfirmButton: false });
          this.loadUsers(userId);
        },
        error: () => Swal.fire('Error', 'No se pudo activar el usuario.', 'error')
      });
    });
  }

deactivateUser(): void {
  if (!this.selectedUser) return;
  Swal.fire({
    title: '¿Desactivar usuario?',
    input: 'textarea',
    inputLabel: 'Motivo de desactivación',
    inputPlaceholder: 'Escribe el motivo...',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value?.trim()) return 'Debes indicar un motivo';
      return null;
    }
  }).then((result) => {
    if (!result.isConfirmed || !this.selectedUser) return;
    const userId = this.selectedUser.userId;
    this.adminService.reviewUser(userId, { action: 'deactivate', reason: result.value }).subscribe({
      next: (updated) => {
        Swal.fire({ title: '¡Desactivado!', text: `${updated.fullName} ha sido desactivado.`, icon: 'success', timer: 2000, showConfirmButton: false });
        this.loadUsers(userId);
      },
      error: () => Swal.fire('Error', 'No se pudo desactivar el usuario.', 'error')
    });
  });
}
  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
