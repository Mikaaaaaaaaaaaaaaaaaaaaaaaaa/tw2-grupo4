import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../services/login';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);

  // Si la petición va a otro lado que no sea nuestra API, la dejamos pasar sin tocar
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Buscamos el token en el servicio (y por las dudas en localStorage)
  let token = loginService.usuario()?.token ?? null;
  if (!token) {
    try {
      const guardado = localStorage.getItem('techstore.usuario');
      if (guardado) {
        token = JSON.parse(guardado)?.token ?? null;
      }
    } catch {
      token = null;
    }
  }

  // Si hay token, clonamos la petición y le pegamos la credencial
  const authReq = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      // Si el servidor responde 401 (token vencido o inválido), cerramos sesión
      if (error instanceof HttpErrorResponse && error.status === 401 && token) {
        loginService.logout();
      }
      return throwError(() => error);
    }),
  );
};
