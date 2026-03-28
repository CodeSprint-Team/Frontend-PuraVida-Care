import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/client/home-client/home-client';
import { MyServicesComponent } from './pages/myservices/myservices.component';

// Auth / Registro
import { Register } from './pages/auth/register/register';
import { RegisterRole } from './pages/register-role/register-role';
import { RegisterClient } from './pages/register-client/register-client';
import { RegisterProvider } from './pages/register-provider/register-provider';
import { RegisterSenior } from './pages/register-senior/register-senior';
import { VerificacionBiometricaComponent } from './pages/biometric-verification/biometric-verification';

// Perfiles
import { ProfileComponent } from './pages/viewProfile/profile/profile';
import { ProfileEdit } from './pages/viewProfile/profile-edit/profile-edit';
import { ProviderProfileComponent } from './pages/viewProfile/provider-profile/provider-profile';
import { ProviderProfileEditComponent } from './pages/viewProfile/provider-profile-edit/provider-profile-edit';
import { FamilyProfileComponent } from './pages/viewProfile/family-profile/family-profile';
import { FamilyProfileEdit } from './pages/viewProfile/family-profile-edit/family-profile-edit';

// Admin
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ProviderRequests } from './pages/provider-requests/provider-requests';


import {ProviderRequestsComponent} from './pages/provider-request-service/provider-request-service';
import { ProviderBookingDetail } from './pages/provider-booking-detail/provider-booking-detail';
import { ProviderStartBooking } from './pages/provider-start-booking/provider-start-booking';
import { ProviderInService } from './pages/provider-in-service/provider-in-service';
import { FamilyTrackingComponent } from './pages/family-tracking/family-tracking';

import { AdminUsers } from './pages/admin-users/admin-users';


// Proveedor
import { ProviderDashboard } from './pages/provider-dashboard/provider-dashboard';

// Cliente / Explorar
import { ExplorarServiciosComponent } from './pages/explore/explore-services/explore-services';
import { PublicProviderProfileComponent } from './pages/publicProvider/public-provider-profile/public-provider-profile';
import { AdminServices } from './pages/admin-services/admin-services';

export const routes: Routes = [
  // General
  { path: '',        redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: Landing },
  { path: 'login',   component: LoginComponent },
  { path: 'home',    component: HomeComponent },

  // Registro
  { path: 'register',          component: Register },
  { path: 'register/role',     component: RegisterRole },
  { path: 'register/client',   component: RegisterClient },
  { path: 'register/provider', component: RegisterProvider },
  { path: 'register/senior',   component: RegisterSenior },

  // Verificación
  { path: 'biometric-verification', component: VerificacionBiometricaComponent },

  // Perfiles
  { path: 'profile/:id',               component: ProfileComponent },
  { path: 'profile-edit/:id',          component: ProfileEdit },
  { path: 'provider-profile/:id',      component: ProviderProfileComponent },
  { path: 'provider-profile-edit/:id', component: ProviderProfileEditComponent },
  { path: 'family-profile/:id',        component: FamilyProfileComponent },
  { path: 'family-profile-edit/:id',   component: FamilyProfileEdit },

  // Admin
  { path: 'admin-dashboard',           component: AdminDashboard },
  { path: 'admin/provider-requests',   component: ProviderRequests },
  { path: 'admin/users',               component: AdminUsers },
  { path: 'admin/services', component: AdminServices },

  // Proveedor
  { path: 'provider-dashboard',        component: ProviderDashboard },

  // Explorar
  { path: 'explorar',      component: ExplorarServiciosComponent },
  { path: 'proveedor/:id', component: PublicProviderProfileComponent },


  { path: 'admin-dashboard/providers',
    component: AdminDashboard
  },
  { path: 'provider-requests-service/:id',
    component: ProviderRequestsComponent 
  },
  { path: 'provider-booking-detail/:id',
    component: ProviderBookingDetail
  },
  { path: 'provider-start-service/:id', 
    component: ProviderStartBooking 
  },
  { path: 'provider-in-service/:id',
    component: ProviderInService
  },
  { path: 'family-tracking/:sessionId',
    component: FamilyTrackingComponent
  },
  {
    path: 'my-services',
    component: MyServicesComponent
  },

  { path: '**', redirectTo: 'landing' }

];



