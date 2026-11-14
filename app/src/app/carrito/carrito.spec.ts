import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Carrito } from './carrito';
import { CarritoService } from '../services/carrito';
import { LoginService } from '../services/login';

describe('Carrito', () => {
  let component: Carrito;
  let fixture: ComponentFixture<Carrito>;
  let router: Router;
  let carritoService: CarritoService;
  let loginService: LoginService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carrito],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(Carrito);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    carritoService = TestBed.inject(CarritoService);
    loginService = TestBed.inject(LoginService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /checkout when finalizarCompra is called with items and logged in', () => {
    vi.spyOn(carritoService, 'items').mockReturnValue([
      { producto: { id: 1, nombre: 'P1', precio: 10, descripcion: '', categoria: '', imagen: '', stock: 10, rating: 5 }, cantidad: 1 }
    ]);
    vi.spyOn(loginService, 'usuario').mockReturnValue({ id: 1, nombre: 'N', email: 'E', token: 'T' });
    vi.spyOn(loginService, 'token', 'get').mockReturnValue('T');
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.finalizarCompra();

    expect(navigateSpy).toHaveBeenCalledWith(['/checkout']);
  });

  it('should show error message when finalizarCompra is called without login', () => {
    vi.spyOn(carritoService, 'items').mockReturnValue([
      { producto: { id: 1, nombre: 'P1', precio: 10, descripcion: '', categoria: '', imagen: '', stock: 10, rating: 5 }, cantidad: 1 }
    ]);
    vi.spyOn(loginService, 'usuario').mockReturnValue(null);

    component.finalizarCompra();

    expect(component.mensajeError).toBe('Iniciá sesión para finalizar tu compra.');
  });
});
