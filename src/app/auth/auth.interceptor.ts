import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Usamos el mismo nombre que tienes en tu AuthService
  const token = localStorage.getItem('session_token');

  // Si tenemos el token, clonamos la petición y le ponemos el prefijo Bearer
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // Si no hay token (ej. en el login), la petición sigue normal
  return next(req);
};
