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

  it('should request login instead of opening the cart for a guest', () => {
    component.abrirCarrito();

    expect(component.carritoAbierto).toBe(false);
    expect(loginService.modalLoginAbierto()).toBe(true);
  });

  it('should navigate to /checkout when finalizarCompra is called with items and logged in', () => {
    vi.spyOn(carritoService, 'items').mockReturnValue([
      { producto: { id: 1, nombre: 'P1', precio: 10, descripcion: '', categoria: '', imagen: '', stock: 10, rating: 5 }, cantidad: 1 }
    ]);
    vi.spyOn(loginService, 'usuario').mockReturnValue({
      id: 1,
      nombre: 'N',
      email: 'E',
      role: 'USER',
      token: 'T',
    });
    vi.spyOn(loginService, 'token', 'get').mockReturnValue('T');
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.finalizarCompra();

    expect(navigateSpy).toHaveBeenCalledWith(['/checkout']);
  });

  it('should request login when a guest tries to finalize a purchase', () => {
    vi.spyOn(carritoService, 'items').mockReturnValue([
      { producto: { id: 1, nombre: 'P1', precio: 10, descripcion: '', categoria: '', imagen: '', stock: 10, rating: 5 }, cantidad: 1 }
    ]);
    vi.spyOn(loginService, 'usuario').mockReturnValue(null);

    component.finalizarCompra();

    expect(loginService.modalLoginAbierto()).toBe(true);
  });

  it('vacía el carrito y elimina su persistencia al cerrar sesión', () => {
    carritoService.agregar({
      id: 1,
      nombre: 'Producto',
      precio: 10,
      descripcion: '',
      categoria: 'Audio',
      imagen: '',
      stock: 5,
      rating: 5,
    });
    expect(localStorage.getItem('techstore.carrito')).not.toBeNull();

    loginService.logout();

    expect(carritoService.items()).toEqual([]);
    expect(localStorage.getItem('techstore.carrito')).toBeNull();
  });
});
