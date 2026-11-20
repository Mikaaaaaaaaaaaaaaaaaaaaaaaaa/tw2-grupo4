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

  readonly producto = signal<Product | undefined>(undefined);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.obtenerPorId$(id).subscribe((prod) => {
      this.producto.set(prod);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.feedbackTimer);
  }

  cantidadEnCarrito(): number {
    const prod = this.producto();
    if (!prod) return 0;
    return (
      this.carritoService.items().find((item) => item.producto.id === prod.id)?.cantidad ?? 0
    );
  }

  stockDisponible(): number {
    const prod = this.producto();
    if (!prod) return 0;
    return Math.max(0, prod.stock - this.cantidadEnCarrito());
  }

  puedeAgregar(): boolean {
    return this.stockDisponible() > 0;
  }

  agregarAlCarrito(): void {
    const prod = this.producto();
    // El admin no compra, aunque el botón no se muestre
    if (this.esAdmin() || !prod) {
      return;
    }

    if (!this.loginService.token) {
      this.loginService.abrirModalLogin();
      return;
    }

    if (!this.carritoService.agregar(prod)) {
      this.mostrarFeedback('error', `No hay más stock disponible de "${prod.nombre}".`);
      return;
    }

    this.mostrarFeedback('ok', `Se agregó "${prod.nombre}" al carrito.`);
  }

  private mostrarFeedback(tipo: 'ok' | 'error', texto: string): void {
    this.feedback.set({ tipo, texto });
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => this.feedback.set(null), 3000);
  }
}
