import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './auth/auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 1. Importar esto

export const appConfig: ApplicationConfig = {

  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    // 3. Habilitar HttpClient con tu interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
