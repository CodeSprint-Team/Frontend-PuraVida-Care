import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/client/home-client/home-client';

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

// Proveedor
import { ProviderDashboard } from './pages/provider-dashboard/provider-dashboard';
import { SolicitudesProveedorComponent } from './pages/solicitudes/solicitudes-proveedor/solicitudes-proveedor';
import { SolicitudDetalleComponent } from './pages/solicitudes/solicitud-detalle/solicitud-detalle';

// Cliente / Explorar
import { ExplorarServiciosComponent } from './pages/explore/explore-services/explore-services';
import { PublicProviderProfileComponent } from './pages/publicProvider/public-provider-profile/public-provider-profile';

// Otros
import { VerificacionBiometricaComponent } from './pages/biometric-verification/biometric-verification';

export const routes: Routes = [

  { path: '',        redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: Landing },
  { path: 'login',   component: LoginComponent },
  { path: 'home',    component: HomeComponent },

  { path: 'profile/:id',      component: ProfileComponent },
  { path: 'profile-edit/:id', component: ProfileEdit },

  { path: 'provider-profile/:id',      component: ProviderProfileComponent },
  { path: 'provider-profile-edit/:id', component: ProviderProfileEditComponent },

  { path: 'family-profile/:id',      component: FamilyProfileComponent },
  { path: 'family-profile-edit/:id', component: FamilyProfileEdit },

  { path: 'admin-dashboard',           component: AdminDashboard },
  { path: 'admin-dashboard/providers', component: AdminDashboard },
  { path: 'admin/provider-requests',   component: ProviderRequests },

  { path: 'provider-dashboard',        component: ProviderDashboard },
  { path: 'proveedor/solicitudes/:id', component: SolicitudesProveedorComponent },
  { path: 'proveedor/solicitud/:id',   component: SolicitudDetalleComponent },

  { path: 'explorar',      component: ExplorarServiciosComponent },
  { path: 'proveedor/:id', component: PublicProviderProfileComponent },

  { path: 'biometric-verification', component: VerificacionBiometricaComponent },

];