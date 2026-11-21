import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProductoService } from './producto';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('marks a product out of the frontend catalog after successful deactivation', () => {
    service.productos.set([
      {
        id: 1,
        nombre: 'Producto activo',
        descripcion: '',
        precio: 10,
        categoria: 'Audio',
        imagen: '',
        stock: 1,
        rating: 5,
      },
      {
        id: 2,
        nombre: 'Otro producto',
        descripcion: '',
        precio: 20,
        categoria: 'Audio',
        imagen: '',
        stock: 1,
        rating: 5,
      },
    ]);

    service.darDeBaja(1).subscribe();

    const request = httpMock.expectOne((req) => req.url.endsWith('/products/1'));
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    expect(service.productos().map((producto) => producto.id)).toEqual([2]);
  });
});
