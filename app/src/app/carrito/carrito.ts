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
    if (!this.carritoService.incrementar(productoId)) {
      this.mensajeError = 'No podés agregar más unidades: alcanzaste el stock disponible.';
    }
  }

  disminuir(productoId: number): void {
    this.mensajeError = '';
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
    this.cerrarCarrito();
    this.router.navigate(['/checkout']);
  }
}
