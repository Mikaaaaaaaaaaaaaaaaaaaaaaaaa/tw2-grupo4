import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login';

export const authGuard: CanActivateFn = () => {
  const login = inject(LoginService);
  const router = inject(Router);

  if (login.usuario()) {
    return true;
  }
  return router.createUrlTree(['/catalogo']);
};