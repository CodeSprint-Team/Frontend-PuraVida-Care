import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { ProfileEdit } from './pages/viewProfile/profile-edit/profile-edit';
import { ProfileComponent } from './pages/viewProfile/profile/profile';
import { ProviderProfileComponent } from './pages/viewProfile/provider-profile/provider-profile';
import { ProviderProfileEditComponent } from './pages/viewProfile/provider-profile-edit/provider-profile-edit';
import { FamilyProfileComponent } from './pages/viewProfile/family-profile/family-profile';
import { FamilyProfileEdit } from './pages/viewProfile/family-profile-edit/family-profile-edit';
import { HomeComponent } from './pages/client/home-client/home-client';
import { Register } from './pages/auth/register/register';
import { RegisterRole } from './pages/register-role/register-role';
import { RegisterClient } from './pages/register-client/register-client';
import { RegisterProvider } from './pages/register-provider/register-provider';
import { RegisterSenior } from './pages/register-senior/register-senior';
import { VerificacionBiometricaComponent } from './pages/biometric-verification/biometric-verification';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ProviderDashboard } from './pages/provider-dashboard/provider-dashboard';
import { ProviderRequests } from './pages/provider-requests/provider-requests';
import { AdminUsers } from './pages/admin-users/admin-users';
import { LoginComponent } from './pages/login/login.component';
import {AdminServices} from './pages/admin-services/admin-services';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'landing',
    component: Landing
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'profile/:id',
    component: ProfileComponent
  },
  {
    path: 'profile-edit/:id',
    component: ProfileEdit
  },
  {
    path: 'provider-profile/:id',
    component: ProviderProfileComponent
  },
  {
    path: 'provider-profile-edit/:id',
    component: ProviderProfileEditComponent
  },
  {
    path: 'family-profile/:id',
    component: FamilyProfileComponent
  },
  {
    path: 'family-profile-edit/:id',
    component: FamilyProfileEdit
  },
  {
    path: 'profile-edit',
    component: ProfileEdit
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: '',
    redirectTo: 'register/role',
    pathMatch: 'full'
  },
  {
    path: 'register/role',
    component: RegisterRole
  },
  {
    path: 'register/client',
    component: RegisterClient
  },
  {
    path: 'register/provider',
    component: RegisterProvider
  },
  {
    path: 'register/senior',
    component: RegisterSenior
  },
  {
    path: 'biometric-verification',
    component: VerificacionBiometricaComponent
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboard
  },
  {
    path: 'provider-dashboard',
    component: ProviderDashboard
  },
  {
    path: 'admin-dashboard/providers',
    component: AdminDashboard
  },
  {
    path: 'admin/provider-requests',
    component: ProviderRequests
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboard
  },
  {
    path: 'admin-dashboard/providers',
    component: AdminDashboard
  },
  {
    path: 'admin/users',
    component: AdminUsers
  },
  {
    path: 'admin/services',
    component: AdminServices
  },

  {
    path: '**',
    redirectTo: 'register/role'
  }
];
