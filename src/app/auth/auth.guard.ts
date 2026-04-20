import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { FRONTEND_LOGIN_URL } from '../api.config';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Intentar obtener token de la URL
  const tokenFromUrl = route.queryParams['token'];

  if (tokenFromUrl) {
    // Guardamos el token en LocalStorage
    authService.setToken(tokenFromUrl);

    // OPCIONAL: Limpia el parámetro 'token' de la URL para que se vea limpia
    // 'replaceUrl: true' evita que el usuario pueda volver atrás al link con el token
    router.navigate([], {
      queryParams: { token: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    return true;
  }

  // 2. Si no hay en URL, revisar si ya está logueado y si el token es VÁLIDO (no expiró)
  // Como actualizamos el método isLoggedIn en el servicio, esto ya valida el tiempo.
  if (authService.isLoggedIn()) {
    return true;
  }

  // 3. Si no hay token o el token ya expiró, mandamos al login externo
  console.warn('Acceso denegado: Token inexistente o expirado.');

  // Limpiamos el localStorage por seguridad si el token estaba vencido
  authService.logout();

  // Redirección
  window.location.href = FRONTEND_LOGIN_URL;
  return false;
};
