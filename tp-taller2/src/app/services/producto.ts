import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private productos: Product[] = [
    { id: 1, nombre: 'MacBook Air M2 Pro 15"', descripcion: 
        'Procesador M2 ultra rápido, 16GB RAM unificada, 512GB SSD NVMe. Pantalla Liquid Retina con más de 1 mil millones de colores.',
         clasificacion: 'Laptops', precio: 1399.99 },
    { id: 2, nombre: 'Teclado Mecánico Wireless RGB', descripcion: 'Switches táctiles silenciosos, iluminación RGB por tecla, batería de larga duración de hasta 200 horas continuas.',
         clasificacion: 'Perifericos', precio: 119.50 },
    { id: 3, nombre: 'Auriculares Noise Cancelling 700', descripcion: 'Cancelación activa de ruido adaptativa de 11 niveles, micrófono cuádruple para llamadas ultra nítidas.',
         clasificacion: 'Audio', precio: 289.00 }
  ];

  obtenerPorId(id: number): Product | undefined {
    return this.productos.find(p => p.id === id);
  }
}
