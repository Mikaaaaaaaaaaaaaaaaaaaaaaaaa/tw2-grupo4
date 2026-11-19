import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { Product } from '../../models/product';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';

@Component({
  imports: [RouterLink],
  selector: 'app-detalle',
  styleUrl: './detalle.css',
  templateUrl: './detalle.html',
})
export class Detalle implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private loginService = inject(LoginService);

  protected readonly esAdmin = this.loginService.esAdmin;
  protected readonly feedback = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  private feedbackTimer?: ReturnType<typeof setTimeout>;

  producto?: Product;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.obtenerPorId$(id).subscribe((prod) => {
      this.producto = prod;
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.feedbackTimer);
  }

  cantidadEnCarrito(): number {
    if (!this.producto) return 0;
    return (
      this.carritoService.items().find((item) => item.producto.id === this.producto!.id)?.cantidad ?? 0
    );
  }

  stockDisponible(): number {
    if (!this.producto) return 0;
    return Math.max(0, this.producto.stock - this.cantidadEnCarrito());
  }

  puedeAgregar(): boolean {
    return this.stockDisponible() > 0;
  }

  agregarAlCarrito(): void {
    // El admin no compra, aunque el botón no se muestre
    if (this.esAdmin() || !this.producto) {
      return;
    }

    if (!this.carritoService.agregar(this.producto)) {
      this.mostrarFeedback('error', `No hay más stock disponible de "${this.producto.nombre}".`);
      return;
    }

    this.mostrarFeedback('ok', `Se agregó "${this.producto.nombre}" al carrito.`);
  }

  private mostrarFeedback(tipo: 'ok' | 'error', texto: string): void {
    this.feedback.set({ tipo, texto });
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => this.feedback.set(null), 3000);
  }
}
