import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const CLAVE_USUARIO = 'techstore.usuario';

function tokenActual(): string | null {
  try {
    const u = JSON.parse(localStorage.getItem(CLAVE_USUARIO) ?? 'null') as
      | { id?: number; token?: string }
      | null;
    if (u?.token) return u.token;
    return u?.id ? `dev-${u.id}` : null;
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = req.url.startsWith(environment.apiUrl) ? tokenActual() : null;
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
