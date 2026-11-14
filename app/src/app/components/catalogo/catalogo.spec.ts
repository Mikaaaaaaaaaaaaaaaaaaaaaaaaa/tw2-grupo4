import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Catalogo } from './catalogo';

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
    httpMock.expectOne((req) => req.url.endsWith('/products')).flush([
      {
        id: 1,
        title: 'MacBook Air M2',
        description: 'Notebook',
        category: 'Laptops',
        price: 1399.99,
        stock: 5,
        rating: 4.8,
      },
    ]);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar todos los productos al iniciar con el filtro Todas', () => {
    component.ngOnInit();

    expect(component.categoriaActiva).toBe('Todos');
    expect(component.productosFiltrados).toEqual(component.productos);
    expect(component.productosFiltrados.length).toBeGreaterThan(0);
  });
});
