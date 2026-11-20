import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Catalogo } from './catalogo';
import { LoginService } from '../../services/login';
import { CarritoService } from '../../services/carrito';
import { ProductoService } from '../../services/producto';

describe('Catalogo', () => {
  let component: Catalogo;
  let fixture: ComponentFixture<Catalogo>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogo],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Catalogo);
    component = fixture.componentInstance;

    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.endsWith('/products')).flush({
      data: [
        {
          id: 1,
          title: 'MacBook Air M2',
          description: 'Notebook',
          category: 'Laptops',
          price: 1399.99,
          stock: 5,
          rating: 4.8,
        },
      ],
      total: 1,
      page: 1,
       limit: 12,
      totalPages: 1,
    });
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar todos los productos al iniciar con el filtro Todas', () => {
    expect(component.limitePorPagina).toBe(12);
    expect(component.categoriaActiva).toBe('Todos');
    expect(component.productosFiltrados).toEqual(component.productos);
    expect(component.productosFiltrados.length).toBeGreaterThan(0);
  });

  it('calcula el rango visible a partir de la paginación real', () => {
    const productoService = TestBed.inject(ProductoService);
    productoService.paginacion.set({ total: 36, page: 2, limit: 12, totalPages: 3 });

    expect(component.inicioResultados).toBe(13);
    expect(component.finResultados).toBe(24);
    expect(component.totalResultados).toBe(36);

    productoService.paginacion.set({ total: 0, page: 1, limit: 12, totalPages: 0 });
    expect(component.inicioResultados).toBe(0);
    expect(component.finResultados).toBe(0);
  });

  it('cambia a 24 productos por página y vuelve a la primera página', () => {
    component.paginaActual = 3;

    component.cambiarLimitePorPagina(24);

    expect(component.limitePorPagina).toBe(24);
    expect(component.paginaActual).toBe(1);
    const request = httpMock.expectOne((req) => req.url.endsWith('/products'));
    expect(request.request.params.get('limit')).toBe('24');
    expect(request.request.params.get('page')).toBe('1');
    request.flush({
      data: [],
      total: 0,
      page: 1,
      limit: 24,
      totalPages: 0,
    });
  });

  it('agrega el producto y solicita iniciar sesión cuando compra un invitado', () => {
    const loginService = TestBed.inject(LoginService);
    const carritoService = TestBed.inject(CarritoService);

    component.agregarAlCarritoDeCompras(component.productosFiltrados[0]);

    expect(carritoService.cantidadTotal()).toBe(1);
    expect(loginService.modalLoginAbierto()).toBe(true);
  });

  it('limpia los filtros al cerrar sesión', () => {
    component.categoriaActiva = 'Audio';
    component.busqueda = 'auriculares';
    component.orden = 'precio-mayor';

    component.cerrarSesion();

    expect(component.categoriaActiva).toBe('Todos');
    expect(component.busqueda).toBe('');
    expect(component.orden).toBe('precio-mayor');
    expect(component.limitePorPagina).toBe(12);
    httpMock.expectOne((req) => req.url.endsWith('/products')).flush({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    });
  });
});
