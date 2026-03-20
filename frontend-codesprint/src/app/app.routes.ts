import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { ProfileEdit } from './profile-edit/profile-edit';
import { Profile } from './profile/profile';
import { HomeComponent } from './client/home-client/home-client';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ProviderDashboard } from './pages/provider-dashboard/provider-dashboard';
import { ProviderRequests } from './pages/provider-requests/provider-requests';
import { AdminUsers } from './pages/admin-users/admin-users';

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
  { path: 'admin-dashboard',
    component: AdminDashboard
  },
  { path: 'admin-dashboard/providers',
    component: AdminDashboard
  },
  {
    path: 'admin/users',
    component: AdminUsers
  },
  {
    path: 'admin/services',
    component: AdminDashboard
  },


];
