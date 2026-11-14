import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';
import { PedidoService } from '../../services/pedido';
import { ProductoService } from '../../services/producto';
import { Nav } from '../../nav/nav';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Nav],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly carritoService = inject(CarritoService);
  readonly loginService = inject(LoginService);
  private readonly pedidoService = inject(PedidoService);
  private readonly productoService = inject(ProductoService);

  paymentForm: FormGroup;
  orderPlaced = signal(false);
  procesando = signal(false);
  mensajeError = signal<string | null>(null);
  lastOrder: any = null;

  constructor() {
    this.paymentForm = this.fb.group({
      method: ['tarjeta', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', [Validators.required, Validators.minLength(3)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    });

    // Reset validations if payment method changes
    this.paymentForm.get('method')?.valueChanges.subscribe(method => {
      const cardFields = ['cardNumber', 'cardHolder', 'expiry', 'cvv'];
      if (method === 'tarjeta') {
        cardFields.forEach(f => this.paymentForm.get(f)?.setValidators([Validators.required, ...this.getValidators(f)]));
      } else {
        cardFields.forEach(f => this.paymentForm.get(f)?.clearValidators());
      }
      cardFields.forEach(f => this.paymentForm.get(f)?.updateValueAndValidity());
    });
  }

  private getValidators(field: string): any[] {
    switch (field) {
      case 'cardNumber': return [Validators.pattern(/^\d{16}$/)];
      case 'cardHolder': return [Validators.minLength(3)];
      case 'expiry': return [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)];
      case 'cvv': return [Validators.pattern(/^\d{3}$/)];
      default: return [];
    }
  }

  confirmPurchase(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const items = this.carritoService.items();
    const usuario = this.loginService.usuario();

    if (!usuario || items.length === 0) return;

    this.procesando.set(true);
    this.mensajeError.set(null);

    const nuevoPedido = {
      userId: usuario.id,
      items: items.map(item => ({
        productId: item.producto.id,
        quantity: item.cantidad,
        unitPrice: item.producto.precio,
      })),
      total: Number(this.carritoService.total().toFixed(2)),
      date: new Date().toISOString().slice(0, 10),
    };

    this.pedidoService.crearPedido(nuevoPedido).subscribe({
      next: (pedido) => {
        this.lastOrder = {
          ...pedido,
          paymentMethod: this.paymentForm.get('method')?.value,
          client: {
            nombre: usuario.nombre,
            email: usuario.email,
          },
          items: items.map(item => ({
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            precio: item.producto.precio,
            subtotal: item.producto.precio * item.cantidad
          })),
          subtotal: this.carritoService.subtotal(),
          impuestos: this.carritoService.impuestos()
        };

        this.orderPlaced.set(true);
        this.carritoService.vaciar();
        this.procesando.set(false);
        this.productoService.cargarProductos(true).subscribe({ error: () => { } });
      },
      error: (err: { error?: { message?: string } }) => {
        this.procesando.set(false);
        this.mensajeError.set(
          err.error?.message ?? 'No se pudo completar la compra. Intentá nuevamente.',
        );
      },
    });
  }

  printInvoice(): void {
    window.print();
  }
}
