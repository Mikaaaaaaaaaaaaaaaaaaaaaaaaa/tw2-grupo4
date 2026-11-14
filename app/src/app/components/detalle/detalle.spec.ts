import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Detalle } from './detalle';

describe('Detalle', () => {
  let component: Detalle;
  let fixture: ComponentFixture<Detalle>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detalle],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Detalle);
    component = fixture.componentInstance;

    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.endsWith('/products/0')).flush({
      id: 0,
      title: 'Producto Prueba',
      description: 'Descripción',
      category: 'Audio',
      price: 100,
    });
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
