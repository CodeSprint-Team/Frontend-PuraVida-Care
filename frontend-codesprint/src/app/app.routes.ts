// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { ProfileEdit } from './viewProfile/profile-edit/profile-edit';
import { ProfileComponent } from './viewProfile/profile/profile';
import { HomeComponent } from './client/home-client/home-client';
import { ProviderProfileComponent } from './viewProfile/provider-profile/provider-profile';
import { ProviderProfileEditComponent } from './viewProfile/provider-profile-edit/provider-profile-edit';
import { FamilyProfileComponent } from './viewProfile/family-profile/family-profile';
import { FamilyProfileEdit } from './viewProfile/family-profile-edit/family-profile-edit';

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
  }
];