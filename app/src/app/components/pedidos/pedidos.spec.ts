import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Pedidos } from './pedidos';

describe('Pedidos', () => {
  let fixture: ComponentFixture<Pedidos>;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/orders`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pedidos],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Pedidos);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('muestra el estado vacío cuando no hay pedidos', async () => {
    http.expectOne(url).flush([]);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('#sin_pedidos_div')?.textContent).toContain('No has realizado compras aún');
    expect(html.querySelector('#lista_pedidos_ul')).toBeNull();
  });

  it('lista los pedidos que devuelve el backend', async () => {
    http.expectOne(url).flush([{
      id: 1, userId: 1, total: 2799.98, date: '2026-10-03T12:00:00.000Z',
      items: [{ productId: 1, productName: 'Remera básica', quantity: 2, unitPrice: 1399.99 }],
    }]);
    await fixture.whenStable();
    const lista = (fixture.nativeElement as HTMLElement).querySelector('#lista_pedidos_ul')?.textContent;
    expect(lista).toContain('Pedido #1');
    expect(lista).toContain('Remera básica');
    expect(lista).toContain('2,799.98');
  });

  it('muestra el error si el backend falla', async () => {
    http.expectOne(url).flush('x', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('#error_p')?.textContent)
      .toContain('No pudimos cargar');
  });
});
