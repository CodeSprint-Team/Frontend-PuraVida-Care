import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { LucideAngularModule, Home, Search, Calendar, MessageCircle, User, Bot } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      LucideAngularModule.pick({ Home, Search, Calendar, MessageCircle, User, Bot })
    )
  ]
};
