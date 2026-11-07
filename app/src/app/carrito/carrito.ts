import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../services/carrito';

@Component({
  imports: [CommonModule],
  selector: 'app-carrito',
  styleUrl: './carrito.css',
  templateUrl: './carrito.html',
})
export class Carrito {
  readonly carritoService = inject(CarritoService);
  carritoAbierto = false;

  abrirCarrito(): void {
    this.carritoAbierto = true;
  }

  cerrarCarrito(): void {
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
}
