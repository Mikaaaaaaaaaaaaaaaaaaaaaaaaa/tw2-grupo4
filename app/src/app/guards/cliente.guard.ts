import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login';

export const clienteGuard: CanActivateFn = () => {
  const login = inject(LoginService);
  const router = inject(Router);

  return login.esAdmin() ? router.createUrlTree(['/catalogo']) : true;
};