import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../services/carrito';
import { LoginService } from '../services/login';
import { PedidoService } from '../services/pedido';

@Component({
  imports: [CommonModule],
  selector: 'app-carrito',
  styleUrl: './carrito.css',
  templateUrl: './carrito.html',
})
export class Carrito {
  readonly carritoService = inject(CarritoService);
  private readonly loginService = inject(LoginService);
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);

  carritoAbierto = false;
  mensajeError = '';

  abrirCarrito(): void {
    this.mensajeError = '';
    this.carritoAbierto = true;
  }

  cerrarCarrito(): void {
    this.mensajeError = '';
    this.carritoAbierto = false;
  }

  incrementar(productoId: number): void {
    this.carritoService.incrementar(productoId);
  }

  disminuir(productoId: number): void {
    this.carritoService.disminuir(productoId);
  }

  eliminar(productoId: number): void {
    this.carritoService.eliminar(productoId);
  }

  finalizarCompra(): void {
    const items = this.carritoService.items();
    if (items.length === 0) return;

    const usuario = this.loginService.usuario();
    if (!usuario || !this.loginService.token) {
      this.mensajeError = 'Iniciá sesión para finalizar tu compra.';
      return;
    }

    this.mensajeError = '';
    this.pedidoService.crearPedido({
      userId: usuario.id,
      items: items.map((item) => ({
        productId: item.producto.id,
        quantity: item.cantidad,
        unitPrice: item.producto.precio,
      })),
      total: Number(this.carritoService.total().toFixed(2)),
      date: new Date().toISOString().slice(0, 10),
    });

    this.carritoService.vaciar();
    this.cerrarCarrito();
    this.router.navigate(['/mis-pedidos']);
  }
}
