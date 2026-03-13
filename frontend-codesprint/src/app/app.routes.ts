import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { ProfileEdit } from './profile-edit/profile-edit';
import { Profile } from './profile/profile';
import { HomeComponent } from './client/home-client/home-client';

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
  }

];
