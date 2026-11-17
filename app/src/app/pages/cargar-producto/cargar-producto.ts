import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormProducto } from '../../components/form-producto/form-producto';
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
  readonly exito = signal(false);

  public guardarProducto(producto: Producto): void {
    this.guardando.set(true);
    this.error.set(null);
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
        this.error.set(this.mensajeParaError(error));
      },
    });
  }

  private mensajeParaError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Ocurrió un error inesperado al guardar el producto. Intentá nuevamente.';
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.';
    }

    if (error.status >= 500) {
      return 'El servidor no pudo guardar el producto. Intentá nuevamente más tarde.';
    }

    return 'El producto fue rechazado por el servidor. Revisá los datos e intentá nuevamente.';
  }
}
