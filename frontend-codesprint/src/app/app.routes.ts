import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { ProfileEdit } from './pages/profile-edit/profile-edit';
import { Profile } from './pages/profile/profile';
import { HomeComponent } from './pages/client/home-client/home-client';
import { MyServicesComponent } from './pages/myservices/myservices.component';
import { HomeFilterComponent } from './pages/home-filter/home-filter.component';
import { ChecklistHogarComponent } from './pages/checklist-hogar/checklist-hogar.component';

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
    path: 'my-services',
    component: MyServicesComponent
  },

  {
    path: 'home-filter',
    component: HomeFilterComponent
  },  

  {
    path: 'checklist-hogar', 
    component: ChecklistHogarComponent
  }
];