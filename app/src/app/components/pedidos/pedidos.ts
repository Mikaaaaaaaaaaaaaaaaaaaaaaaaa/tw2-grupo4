import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido';
import { ProductoService } from '../../services/producto';
import { Nav } from '../../nav/nav';

@Component({
  imports: [RouterLink, DatePipe, DecimalPipe, Nav],
  selector: 'app-pedidos',
  templateUrl: './pedidos.html',
  host: { class: 'block' },
})
export class Pedidos implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly productoService = inject(ProductoService);

  public readonly pedidos = this.pedidoService.pedidos;

  private readonly nombres = computed(
    () =>
      new Map(
        this.productoService.productos().map((p) => [p.id, p.nombre] as const),
      ),
  );

  ngOnInit(): void {
    this.pedidoService.cargarPedidos().subscribe({ error: () => { } });
    if (this.productoService.productos().length === 0) {
      this.productoService.cargarProductos().subscribe({ error: () => { } });
    }
  }

  public nombreProducto(productId: number): string {
    return this.nombres().get(productId) ?? `Producto #${productId}`;
  }
}
