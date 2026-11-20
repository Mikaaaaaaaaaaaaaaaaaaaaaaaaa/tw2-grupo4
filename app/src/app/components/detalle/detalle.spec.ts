import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Detalle } from './detalle';
import { CarritoService } from '../../services/carrito';

describe('Detalle', () => {
  let component: Detalle;
  let fixture: ComponentFixture<Detalle>;
  let httpMock: HttpTestingController;
  let carritoService: CarritoService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Detalle],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    carritoService = TestBed.inject(CarritoService);
    fixture = TestBed.createComponent(Detalle);
    component = fixture.componentInstance;

    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.endsWith('/products/0')).flush({
      id: 1,
      title: 'Auriculares',
      description: 'Descripción',
      category: 'Audio',
      price: 100,
      stock: 2,
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agrega al carrito hasta agotar el stock disponible y luego bloquea', () => {
    expect(component.stockDisponible()).toBe(2);
    expect(component.puedeAgregar()).toBe(true);

    component.agregarAlCarrito();
    component.agregarAlCarrito();

    expect(component.cantidadEnCarrito()).toBe(2);
    expect(component.stockDisponible()).toBe(0);
    expect(component.puedeAgregar()).toBe(false);

    component.agregarAlCarrito();

    expect(component.cantidadEnCarrito()).toBe(2);
    expect(carritoService.cantidadTotal()).toBe(2);
  });

  it('deshabilita el boton si el producto no tiene stock', async () => {
    component.producto.set({ ...component.producto()!, stock: 0 });
    fixture.detectChanges();
    await fixture.whenStable();

    const boton = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(boton?.disabled).toBe(true);
    expect(component.puedeAgregar()).toBe(false);
  });
});
