import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { ProfileEdit } from './pages/profile-edit/profile-edit';
import { Profile } from './pages/profile/profile';
import { HomeComponent } from './pages/client/home-client/home-client';
import {VerificacionBiometricaComponent} from './pages/biometric-verification/biometric-verification';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ProviderDashboard } from './pages/provider-dashboard/provider-dashboard';
import { ProviderRequests } from './pages/provider-requests/provider-requests';



export const routes: Routes = [

  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
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
    path: 'profile',
    component: Profile
  },

  {
    path: 'profile-edit',
    component: ProfileEdit
  },

  {
    path: 'biometric-verification',
    component: VerificacionBiometricaComponent
  }

  { path: 'admin-dashboard',
    component: AdminDashboard
  },

  { path: 'provider-dashboard',
    component: ProviderDashboard
  },

  { path: 'admin-dashboard/providers',
    component: AdminDashboard
  },
  { path: 'admin/provider-requests',
    component: ProviderRequests
  },

];
