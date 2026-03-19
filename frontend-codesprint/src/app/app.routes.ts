import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { ProfileEdit } from './pages/profile-edit/profile-edit';
import { Profile } from './pages/profile/profile';
import { HomeComponent } from './pages/client/home-client/home-client';
import { Register } from './pages/auth/register/register';
import { RegisterRole } from './pages/register-role/register-role';
import { RegisterClient } from './pages/register-client/register-client';
import { RegisterProvider } from './pages/register-provider/register-provider';
import { RegisterSenior } from './pages/register-senior/register-senior';

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

  { path: 'register',
    component: Register
  },

  { path: '',
    redirectTo: 'register/role',
    pathMatch: 'full'
  },

  { path: 'register/role',
    component: RegisterRole 
  },

  { path: 'register/client',
    component: RegisterClient
  },

  { path: 'register/provider',
    component: RegisterProvider
  },

  { path: 'register/senior',
    component: RegisterSenior
  },
  
    { path: '**',
      redirectTo: 'register/role'
    }

];
