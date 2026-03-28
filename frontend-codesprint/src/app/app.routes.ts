import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/client/home-client/home-client';

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
import { AdminUsers } from './pages/admin-users/admin-users';

// Proveedor
import { ProviderDashboard } from './pages/provider-dashboard/provider-dashboard';
import { SolicitudesProveedorComponent } from './pages/solicitudes/solicitudes-proveedor/solicitudes-proveedor';
import { SolicitudDetalleComponent } from './pages/solicitudes/solicitud-detalle/solicitud-detalle';

// Cliente / Explorar
import { ExplorarServiciosComponent } from './pages/explore/explore-services/explore-services';
import { PublicProviderProfileComponent } from './pages/publicProvider/public-provider-profile/public-provider-profile';

//Bienes de apoyo
import { CreateSupportProductPostComponent } from './pages/create-support-product-post/create-support-product-post';
import { SupportProductsMarketplace } from './pages/support-products-marketplace/support-products-marketplace';
import { SupportProductDetail } from './pages/support-product-detail/support-product-detail';

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
  { path: 'admin-dashboard/providers', component: AdminDashboard },
  { path: 'admin/provider-requests',   component: ProviderRequests },
  { path: 'admin/users',               component: AdminUsers },
  { path: 'admin/services',            component: AdminDashboard },

  // Proveedor
  { path: 'provider-dashboard',        component: ProviderDashboard },
  { path: 'proveedor/solicitudes/:id', component: SolicitudesProveedorComponent },
  { path: 'proveedor/solicitud/:id',   component: SolicitudDetalleComponent },

  // Explorar
  { path: 'explorar',      component: ExplorarServiciosComponent },
  { path: 'proveedor/:id', component: PublicProviderProfileComponent },

  // Bienes de apoyo
  { path: 'support-products/create', component: CreateSupportProductPostComponent },
  { path: 'support-products', component: SupportProductsMarketplace },
  {path: 'support-products/:id', component: SupportProductDetail },

  // Wildcard (siempre al final)
  { path: '**', redirectTo: 'landing' },
];