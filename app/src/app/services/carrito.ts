import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product';

export interface ItemCarrito {
  producto: Product;
  cantidad: number;
}

const CLAVE_STORAGE = 'techstore.carrito';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly itemsSignal = signal<ItemCarrito[]>(this.cargar());

  readonly items = this.itemsSignal.asReadonly();
  readonly cantidadTotal = computed(() =>
    this.itemsSignal().reduce((total, item) => total + item.cantidad, 0),
  );
  readonly subtotal = computed(() =>
    this.itemsSignal().reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0,
    ),
  );

  readonly impuestos = computed(() => this.subtotal() * 0.21);
  readonly total = computed(() => this.subtotal() + this.impuestos());

  agregar(producto: Product): void {
    this.itemsSignal.update((items) => {
      const existente = items.find((item) => item.producto.id === producto.id);

      if (existente) {
        return items.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [...items, { producto, cantidad: 1 }];
    });
    this.guardar();
  }

  incrementar(productoId: number): void {
    this.itemsSignal.update((items) =>
      items.map((item) =>
        item.producto.id === productoId
          ? { ...item, cantidad: item.cantidad + 1 }
          : item,
      ),
    );
    this.guardar();
  }

  disminuir(productoId: number): void {
    this.itemsSignal.update((items) =>
      items
        .map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
    this.guardar();
  }

  eliminar(productoId: number): void {
    this.itemsSignal.update((items) =>
      items.filter((item) => item.producto.id !== productoId),
    );
    this.guardar();
  }

  vaciar(): void {
    this.itemsSignal.set([]);
    this.guardar();
  }

  private cargar(): ItemCarrito[] {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (!guardado) return [];

      const items = JSON.parse(guardado) as ItemCarrito[];
      return Array.isArray(items)
        ? items.filter(
            (item) =>
              item?.producto &&
              Number.isFinite(item.producto.id) &&
              Number.isFinite(item.producto.precio) &&
              Number.isFinite(item.cantidad) &&
              item.cantidad > 0,
          )
        : [];
    } catch {
      return [];
    }
  }

  private guardar(): void {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(this.itemsSignal()));
    } catch {
      
    }
  }
}
