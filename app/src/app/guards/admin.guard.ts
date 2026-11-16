import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login';

export const adminGuard: CanActivateFn = () => {
  const login = inject(LoginService);
  const router = inject(Router);

  return login.esAdmin() ? true : router.createUrlTree(['/catalogo']);
};