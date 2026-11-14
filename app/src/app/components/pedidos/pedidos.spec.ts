import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Pedidos } from './pedidos';
import { PedidoService } from '../../services/pedido';

describe('Pedidos', () => {
  let fixture: ComponentFixture<Pedidos>;
  let pedidoService: PedidoService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Pedidos],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    pedidoService = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Pedidos);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', async () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.endsWith('/pedidos')).flush([]);
    httpMock.expectOne((req) => req.url.endsWith('/products')).flush([]);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el estado vacío cuando no hay pedidos', async () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.endsWith('/pedidos')).flush([]);
    httpMock.expectOne((req) => req.url.endsWith('/products')).flush([]);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;

    expect(html.querySelector('#sin_pedidos_div')?.textContent).toContain(
      'No has realizado compras aún',
    );
    expect(html.querySelector('#lista_pedidos_ul')).toBeNull();
  });

  it('lista los pedidos cuando ya hay compras', async () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.endsWith('/pedidos')).flush([{
      id: 1,
      userId: 12,
      items: [{ productId: 1, quantity: 2, unitPrice: 1399.99 }],
      total: 2799.98,
      date: '2026-10-03',
    }]);
    httpMock.expectOne((req) => req.url.endsWith('/products')).flush([
      {
        id: 1,
        title: 'MacBook Air M2 Pro 15"',
        description: 'Laptop',
        category: 'Laptops',
        price: 1399.99,
      },
    ]);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const lista = html.querySelector('#lista_pedidos_ul')?.textContent;

    expect(html.querySelector('#sin_pedidos_div')).toBeNull();
    expect(lista).toContain('Pedido #1');
    expect(lista).toContain('03/10/2026');
    expect(lista).toContain('MacBook Air M2 Pro 15"');
    expect(lista).toContain('2,799.98');
  });
});
