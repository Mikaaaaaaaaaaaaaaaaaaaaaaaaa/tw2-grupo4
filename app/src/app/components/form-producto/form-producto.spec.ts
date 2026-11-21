import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Producto } from '../../models/producto.interface';
import { FormProducto } from './form-producto';
import { provideRouter } from '@angular/router';

describe('FormProducto', () => {
  let fixture: ComponentFixture<FormProducto>;
  let component: FormProducto;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormProducto],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormProducto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe iniciar con un formulario inválido', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('debe ser válido con datos correctos', () => {
    component.form.setValue({
      nombre: 'Teclado Mecánico RGB',
      clasificacion: 'Periféricos',
      precio: 199.99,
      stock: 1,
      imagen: 'https://images.unsplash.com/imagen.jpg',
      descripcion: 'Teclado mecánico con iluminación RGB.',
    });

    expect(component.form.valid).toBe(true);
  });

  it('debe rechazar un precio igual a cero', () => {
    component.form.controls.precio.setValue(0);

    expect(component.form.controls.precio.hasError('min')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('debe rechazar stock igual a cero', () => {
    component.form.controls.stock.setValue(0);

    expect(component.form.controls.stock.hasError('min')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('debe emitir el producto con id cero', () => {
    const productoEsperado: Producto = {
      id: 0,
      nombre: 'Teclado Mecánico RGB',
      clasificacion: 'Periféricos',
      precio: 199.99,
      stock: 1,
      descripcion: 'Teclado mecánico con iluminación RGB.',
      imagen: 'https://images.unsplash.com/imagen.jpg',
    };
    let productoEmitido: Producto | undefined;

    component.form.setValue({
      nombre: ' Teclado Mecánico RGB ',
      clasificacion: 'Periféricos',
      precio: 199.99,
      stock: 1,
      imagen: 'https://images.unsplash.com/imagen.jpg',
      descripcion: ' Teclado mecánico con iluminación RGB. ',
    });
    component.productoGuardado.subscribe((producto) => {
      productoEmitido = producto;
    });

    component.enviar();

    expect(productoEmitido).toEqual(productoEsperado);
  });

  it('precarga los datos y conserva el id cuando se usa para modificar', () => {
    const producto: Producto = {
      id: 17,
      nombre: 'Mouse Gamer',
      clasificacion: 'Periféricos',
      precio: 150,
      stock: 3,
      descripcion: 'Mouse inalámbrico para gaming',
      imagen: 'https://images.example.com/mouse.jpg',
    };
    fixture.componentRef.setInput('productoInicial', producto);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      nombre: producto.nombre,
      clasificacion: producto.clasificacion,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
    });

    let productoEmitido: Producto | undefined;
    component.productoGuardado.subscribe((value) => {
      productoEmitido = value;
    });
    component.enviar();

    expect(productoEmitido?.id).toBe(producto.id);
  });
});
