import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ROLE_OPTIONS } from '../../constants/role';
import { RoleOption } from '../../interfaces/auth/role-option.interface';

@Component({
  selector: 'app-register-role',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './register-role.html',
  styleUrl: './register-role.css',
})
export class RegisterRole implements OnInit {
  roles: RoleOption[] = ROLE_OPTIONS;
  selectedRole: RoleOption | null = null;
  isGoogleUser = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Si viene de Google, el user_id ya está en localStorage
    this.isGoogleUser = !!localStorage.getItem('user_id');
  }

  selectRole(role: RoleOption): void {
    this.selectedRole = role;
  }

  continue(): void {
    if (!this.selectedRole) return;

    switch (this.selectedRole.key) {
      case 'CLIENT':
        this.router.navigate(['/register/client']);
        break;
      case 'PROVIDER':
        this.router.navigate(['/register/provider']);
        break;
      case 'SENIOR':
        this.router.navigate(['/register/senior']);
        break;
    }
  }

  getIconBgClass(role: RoleOption): string {
    return this.selectedRole?.key === role.key ? 'bg-teal-100' : 'bg-slate-100';
  }

  getIconColorClass(role: RoleOption): string {
    return this.selectedRole?.key === role.key ? 'text-teal-600' : 'text-slate-500';
  }
}