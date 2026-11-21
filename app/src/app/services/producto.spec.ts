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

  it('updates the product through the API and refreshes the cached item', () => {
    const producto = {
      id: 8,
      nombre: 'Teclado actualizado',
      descripcion: 'Descripción actualizada del teclado',
      clasificacion: 'Periféricos',
      precio: 125,
      stock: 4,
      imagen: 'https://images.example.com/teclado.jpg',
    };
    service.productos.set([
      {
        id: producto.id,
        nombre: 'Teclado anterior',
        descripcion: 'Descripción anterior',
        categoria: producto.clasificacion,
        precio: 100,
        stock: 2,
        imagen: producto.imagen,
        rating: 4,
      },
    ]);

    service.actualizar(producto).subscribe();

    const request = httpMock.expectOne((req) => req.url.endsWith('/products/8'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      title: producto.nombre,
      description: producto.descripcion,
      category: producto.clasificacion,
      price: producto.precio,
      stock: producto.stock,
      image: producto.imagen,
    });
    request.flush({
      id: producto.id,
      title: producto.nombre,
      description: producto.descripcion,
      category: producto.clasificacion,
      price: producto.precio,
      stock: producto.stock,
      image: producto.imagen,
    });
    expect(service.productos()[0].nombre).toBe(producto.nombre);
  });
});
