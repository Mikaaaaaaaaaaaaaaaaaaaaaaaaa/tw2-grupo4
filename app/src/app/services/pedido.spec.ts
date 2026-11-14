import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido';
import { PedidoService } from './pedido';

const url = `${environment.apiUrl}/orders`;
const pedido: Pedido = {
  id: 1, userId: 1, total: 239, date: '2026-10-03T12:00:00.000Z',
  items: [{ productId: 2, productName: 'Teclado', quantity: 2, unitPrice: 119.5 }],
};

describe('PedidoService', () => {
  let service: PedidoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PedidoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('cargar publica los pedidos del backend', () => {
    service.cargar();
    expect(service.cargando()).toBe(true);
    http.expectOne(url).flush([pedido]);
    expect(service.pedidos()).toEqual([pedido]);
    expect(service.cargando()).toBe(false);
  });

  it('cargar informa el error si falla', () => {
    service.cargar();
    http.expectOne(url).flush('error', { status: 500, statusText: 'Server Error' });
    expect(service.error()).toContain('No pudimos cargar');
    expect(service.pedidos()).toEqual([]);
  });

  it('cargar pide iniciar sesion cuando recibe 401', () => {
    service.cargar();
    http.expectOne(url).flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(service.error()).toBe('Iniciá sesión para ver tus pedidos.');
  });

  it('crearPedido hace POST solo con los items y suma el pedido al principio', () => {
    service.crearPedido([{ productId: 2, quantity: 2 }]).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ items: [{ productId: 2, quantity: 2 }] });
    req.flush(pedido);
    expect(service.pedidos()[0]).toEqual(pedido);
  });
});
