import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Producto } from '../../models/producto.interface';
import { CATEGORIAS } from '../../models/categorias.const';

type ProductoFormControls = {
  nombre: FormControl<string>;
  clasificacion: FormControl<string>;
  precio: FormControl<number>;
  stock: FormControl<number>;
  imagen: FormControl<string>;
  descripcion: FormControl<string>;
};

const noSoloEspacios: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null =>
  control.value.trim().length > 0 ? null : { soloEspacios: true };

@Component({
  selector: 'app-form-producto',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './form-producto.html',
  styleUrl: './form-producto.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormProducto {
  readonly guardando = input(false);
  readonly productoGuardado = output<Producto>();
  readonly categorias = CATEGORIAS;

  readonly form: FormGroup<ProductoFormControls>;

  private readonly mensajesError: Record<
    keyof ProductoFormControls,
    Partial<Record<string, string>>
  > = {
    nombre: {
      required: 'El nombre es obligatorio.',
      minlength: 'El nombre debe tener al menos 3 caracteres.',
      maxlength: 'El nombre no puede superar los 80 caracteres.',
      soloEspacios: 'El nombre no puede contener solo espacios.',
    },
    clasificacion: {
      required: 'Seleccioná una categoría.',
    },
    precio: {
      required: 'El precio es obligatorio.',
      min: 'El precio debe ser mayor a 0.',
    },
    stock: {
      required: 'El stock es obligatorio.',
      min: 'El stock debe ser al menos 1.',
      pattern: 'El stock debe ser un número entero.',
    },
    imagen: {
      pattern: 'Ingresá una URL válida que comience con http:// o https://.',
    },
    descripcion: {
      required: 'La descripción es obligatoria.',
      minlength: 'La descripción debe tener al menos 10 caracteres.',
      maxlength: 'La descripción no puede superar los 500 caracteres.',
    },
  };

  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        noSoloEspacios,
      ]],
      clasificacion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [1, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/),
      ]],
      imagen: ['', Validators.pattern(/^https?:\/\/\S+$/i)],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
      ]],
    });
  }

  public enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const imagen = valores.imagen.trim();
    const producto: Producto = {
      id: 0,
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      clasificacion: valores.clasificacion.trim(),
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      ...(imagen ? { imagen } : {}),
    };

    this.productoGuardado.emit(producto);
  }

  public reiniciar(): void {
    this.form.reset({
      nombre: '',
      clasificacion: '',
      precio: 0,
      stock: 1,
      imagen: '',
      descripcion: '',
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  public tieneError(campo: keyof ProductoFormControls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  public mensajeError(campo: keyof ProductoFormControls): string | null {
    if (!this.tieneError(campo)) {
      return null;
    }

    const errores = this.form.controls[campo].errors;
    if (!errores) {
      return null;
    }

    const mensajes = this.mensajesError[campo];
    const tipoError = Object.keys(errores).find((tipo) => mensajes[tipo]);
    return tipoError ? mensajes[tipoError] ?? null : null;
  }
}
