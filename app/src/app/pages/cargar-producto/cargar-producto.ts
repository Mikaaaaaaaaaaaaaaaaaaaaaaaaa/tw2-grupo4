import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormProducto,
  type CampoProducto,
} from '../../components/form-producto/form-producto';
import { Producto } from '../../models/producto.interface';
import { ProductoService } from '../../services/producto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cargar-producto',
  imports: [FormProducto],
  templateUrl: './cargar-producto.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CargarProducto {
  private readonly router = inject(Router);
  private readonly productoService = inject(ProductoService);
  private readonly formulario = viewChild(FormProducto);

  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly erroresServidor = signal<
    Partial<Record<CampoProducto, string>>
  >({});
  readonly exito = signal(false);

  public guardarProducto(producto: Producto): void {
    this.guardando.set(true);
    this.error.set(null);
    this.erroresServidor.set({});
    this.exito.set(false);

    this.productoService.crear(producto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set(true);
        this.formulario()?.reiniciar();
        
        setTimeout(() => {
          this.router.navigate(['/catalogo']);
        }, 1500);
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.manejarError(error);
      },
    });
  }

  private manejarError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.error.set(
        'Ocurrió un error inesperado al guardar el producto. Intentá nuevamente.',
      );
      return;
    }

    if (error.status === 0) {
      this.error.set(
        'No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.',
      );
      return;
    }

    if (error.status >= 500) {
      this.error.set(
        'El servidor no pudo guardar el producto. Intentá nuevamente más tarde.',
      );
      return;
    }

    if (error.status === 401) {
      this.error.set('Tu sesión no es válida. Iniciá sesión nuevamente.');
      return;
    }

    if (error.status === 403) {
      this.error.set('No tenés permisos para cargar productos.');
      return;
    }

    if (error.status === 400) {
      const errores = this.extraerErrores(error.error);
      if (Object.keys(errores).length > 0) {
        this.erroresServidor.set(errores);
        return;
      }
    }

    this.error.set(
      'El producto fue rechazado por el servidor. Revisá los datos e intentá nuevamente.',
    );
  }

  private extraerErrores(
    body: unknown,
  ): Partial<Record<CampoProducto, string>> {
    if (typeof body !== 'object' || body === null || !('errores' in body)) {
      return {};
    }

    const errores = body.errores;
    if (!Array.isArray(errores)) {
      return {};
    }

    const campos: Record<string, CampoProducto> = {
      title: 'nombre',
      description: 'descripcion',
      category: 'clasificacion',
      price: 'precio',
      stock: 'stock',
      image: 'imagen',
    };
    const resultado: Partial<Record<CampoProducto, string>> = {};

    for (const item of errores) {
      if (
        typeof item === 'object' &&
        item !== null &&
        'campo' in item &&
        'mensaje' in item &&
        typeof item.campo === 'string' &&
        typeof item.mensaje === 'string' &&
        campos[item.campo]
      ) {
        resultado[campos[item.campo]] = item.mensaje;
      }
    }

    return resultado;
  }
}
