import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checkout } from './checkout';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';
import { PedidoService } from '../../services/pedido';

describe('Checkout Component', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;
  let carritoService: CarritoService;
  let loginService: LoginService;
  let pedidoService: PedidoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkout, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        CarritoService,
        LoginService,
        PedidoService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    carritoService = TestBed.inject(CarritoService);
    loginService = TestBed.inject(LoginService);
    pedidoService = TestBed.inject(PedidoService);

    // Mock login signal
    vi.spyOn(loginService, 'usuario').mockReturnValue({
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      token: 'fake-token'
    });

    // Mock items signal
    vi.spyOn(carritoService, 'items').mockReturnValue([
      {
        producto: { id: 1, nombre: 'Product 1', precio: 100, descripcion: '', categoria: '', imagen: '', stock: 10, rating: 5 },
        cantidad: 2
      }
    ]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate credit card fields when method is tarjeta', () => {
    component.paymentForm.patchValue({ method: 'tarjeta' });
    expect(component.paymentForm.valid).toBe(false);
    
    component.paymentForm.patchValue({
      cardNumber: '1234567812345678',
      cardHolder: 'Test User',
      expiry: '12/25',
      cvv: '123'
    });
    expect(component.paymentForm.valid).toBe(true);
  });

  it('should be valid without card fields when method is transferencia', () => {
    component.paymentForm.patchValue({ method: 'transferencia' });
    expect(component.paymentForm.valid).toBe(true);
  });

  it('should process purchase and set orderPlaced to true', () => {
    component.paymentForm.patchValue({ method: 'transferencia' });
    const pedidoSpy = vi.spyOn(pedidoService, 'crearPedido');
    const vaciarSpy = vi.spyOn(carritoService, 'vaciar');

    component.confirmPurchase();

    expect(pedidoSpy).toHaveBeenCalled();
    expect(vaciarSpy).toHaveBeenCalled();
    expect(component.orderPlaced()).toBe(true);
  });
});
