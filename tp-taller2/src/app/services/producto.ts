import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductoService {
 private productos: Product[] = [
  { id: 1, nombre: 'MacBook Air M2 Pro 15"', categoria: 'Laptops', precio: 1399.99,
    imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60', stock: 15, rating: 4.9,
    descripcion: 'Procesador M2 ultra rápido, 16GB RAM unificada, 512GB SSD NVMe. Pantalla Liquid Retina con más de 1 mil millones de colores.' },
  { id: 2, nombre: 'Teclado Mecánico Wireless RGB', categoria: 'Perifericos', precio: 119.5,
    imagen: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60', stock: 40, rating: 4.7,
    descripcion: 'Switches táctiles silenciosos, iluminación RGB por tecla, batería de hasta 200 horas continuas.' },
  { id: 3, nombre: 'Auriculares Noise Cancelling 700', categoria: 'Audio', precio: 289,
    imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60', stock: 22, rating: 4.8,
    descripcion: 'Cancelación activa de ruido adaptativa de 11 niveles, micrófono cuádruple para llamadas nítidas.' }
];

  obtenerPorId(id: number): Product | undefined {
    return this.productos.find(p => p.id === id);
  }
}
