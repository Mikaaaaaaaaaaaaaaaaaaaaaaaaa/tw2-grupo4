import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PedidoService } from './pedido';
import { NuevoPedido } from '../models/pedido';

const base: NuevoPedido = {
  userId: 1,
  items: [{ productId: 2, quantity: 1, unitPrice: 119.5 }],
  total: 119.5,
  date: '2026-10-03',
};

describe('PedidoService', () => {
  let service: PedidoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('agrega los pedidos recibidos del backend al principio', () => {
    service.crearPedido(base).subscribe();
    httpMock.expectOne((req) => req.url.endsWith('/pedidos')).flush({ id: 1, ...base });
    service.crearPedido(base).subscribe();
    httpMock.expectOne((req) => req.url.endsWith('/pedidos')).flush({ id: 2, ...base });

    expect(service.pedidos().map((pedido) => pedido.id)).toEqual([2, 1]);
  });

  it('carga los pedidos desde el backend', () => {
    service.cargarPedidos().subscribe();
    httpMock.expectOne((req) => req.url.endsWith('/pedidos')).flush([{ id: 4, ...base }]);

    expect(service.pedidos().map((pedido) => pedido.id)).toEqual([4]);
  });
});
