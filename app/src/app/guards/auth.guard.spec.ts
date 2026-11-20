import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { authGuard } from './auth.guard';
import { LoginService } from '../services/login';

@Component({ template: '' })
class ProtectedPage {}

describe('authGuard', () => {
  it('opens login and blocks protected navigation for a guest', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'mis-pedidos', component: ProtectedPage, canActivate: [authGuard] },
        ]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const loginService = TestBed.inject(LoginService);
    const navigated = await router.navigateByUrl('/mis-pedidos');

    expect(navigated).toBe(false);
    expect(router.url).toBe('/');
    expect(loginService.modalLoginAbierto()).toBe(true);
  });
});
