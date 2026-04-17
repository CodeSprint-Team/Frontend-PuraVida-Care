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

import {AgendaCliente} from './pages/agenda-cliente/agenda-cliente';
import {CalendarioCliente} from './pages/calendario-cliente/calendario-cliente';
import {DetalleCitaCliente} from './pages/detalle-cita-cliente/detalle-cita-cliente';

import { AdminServices } from './pages/admin-services/admin-services';

import {AdminProfileComponent} from './pages/viewProfile/admin-profile/admin-profile';
import {AdminProfileEditComponent} from './pages/viewProfile/admin-profile-edit/admin-profile-edit';
import {SelectService} from './pages/select-service/select-service';
import {ConfirmBooking} from './pages/confirm-booking/confirm-booking';

//Bienes de apoyo
import { CreateSupportProductPostComponent } from './pages/create-support-product-post/create-support-product-post';
import { SupportProductsMarketplace } from './pages/support-products-marketplace/support-products-marketplace';
import { SupportProductDetail } from './pages/support-product-detail/support-product-detail';
import { SupportProductReceivedOffers } from './pages/support-product-received-offers/support-product-received-offers';
import { SupportProductMadeOffers } from './pages/support-product-made-offers/support-product-made-offers';


import { MyCompletedServicesComponent } from './pages/my-completed-services/my-completed-services';
import { CreateReviewComponent } from './pages/create-review/create-review';
import { AdminProductSupportCatalog } from './pages/admin-product-support-catalog/admin-product-support-catalog';
import { AdminServiceCategory } from './pages/admin-service-category/admin-service-category';
import { CreateServicesComponent } from './pages/createServices/create-services/create-services';
import { ChatIAComponent } from './pages/chat-AI/chat-ia/chat-ia';
import { ResultadosRecomendadosComponent } from './pages/chat-AI/resultadosrecomendados/resultadosrecomendados';
<<<<<<< HEAD
import { ChatComponent } from './pages/chatMessage/chat.component/chat.component';
import { ConversationListComponent } from './pages/chatMessage/conversation-list.component/conversation-list.component';
=======
import { FilteredHome } from './pages/filtered-home/filtered-home';

>>>>>>> aa677e1b839c85a55330fca225c415212165a810



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
  { path: 'admin-profile/:id',          component: AdminProfileComponent},
  { path: 'admin-profile-edit/:id',     component: AdminProfileEditComponent},


  //Cliente
  { path: 'select-service', component: SelectService },
  { path: 'confirm-booking', component: ConfirmBooking },
  { path: 'filtered-home', component: FilteredHome },


  // Proveedor
  { path: 'provider-dashboard',        component: ProviderDashboard },

  //Cliente
  { path: 'agenda-cliente', component: AgendaCliente },
  { path: 'calendario-cliente', component: CalendarioCliente },
  { path: 'detalle-cita-cliente/:id', component: DetalleCitaCliente },

  // Explorar
  { path: 'explorar',      component: ExplorarServiciosComponent },
  { path: 'proveedor/:id', component: PublicProviderProfileComponent },
  { path: 'support-products/create', component: CreateSupportProductPostComponent },
  { path: 'support-products', component: SupportProductsMarketplace },
  {path: 'support-products/received-offers', component: SupportProductReceivedOffers },
  {path: 'support-products/made-offers', component: SupportProductMadeOffers },
  {path: 'support-products/:id', component: SupportProductDetail },





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
  {
    path: 'create-service',
    component: CreateServicesComponent
  },
  {
    path: 'my-completed-services',
    component: MyCompletedServicesComponent
  },
  {
    path: 'create-review/:providerId',
    component: CreateReviewComponent
  },
  {path: 'admin/product-support-catalog',
    component: AdminProductSupportCatalog      
  },
  {
    path: 'admin/service-categories',
    component: AdminServiceCategory
  },
  {
    path: 'chat-ia',
    component: ChatIAComponent
  },
  {
    path: 'resultados-recomendados',
    component: ResultadosRecomendadosComponent
  },
  {
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'connversation-list',
    component: ConversationListComponent
  },


  { path: '**', redirectTo: 'landing' }

];

