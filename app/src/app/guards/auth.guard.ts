import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);

  if (loginService.token) {
    return true;
  }

  loginService.abrirModalLogin();
  return false;
};
