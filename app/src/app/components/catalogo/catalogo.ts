import { Component, OnInit, effect } from '@angular/core';
import { Product } from '../../models/product';
import { ProductoService } from '../../services/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Login } from '../login/login';
import { Carrito } from '../../carrito/carrito';
import { Nav } from '../../nav/nav';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';

@Component({
  imports: [FormsModule, CommonModule, RouterModule, Login, Carrito, Nav],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  public productos: Product[] = [];
  public productosFiltrados: Product[] = [];
  public mostrarLogin: boolean = false;
  public get usuarioActual(): string | null {
    return this.loginService.usuario()?.nombre ?? null;
  }
  public categorias: string[] = ['Todos', 'Laptops', 'Perifericos', 'Audio', 'Componentes'];
  public categoriaActiva: string = 'Todos';
  public busqueda: string = '';
  public orden: string = 'Destacados';

  public mensajeToast: string | null = null;

  public constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private loginService: LoginService,
  ) {
    effect(() => {
      const lista = this.productoService.productos();
      if (lista.length > 0) {
        this.productos = lista;
        this.aplicarFiltrosBusquedas();
      }
    });
  }

  public ngOnInit(): void {
    this.productoService.cargarProductos().subscribe({
      next: (lista) => {
        this.productos = lista;
        this.aplicarFiltrosBusquedas();
      },
      error: () => {
        this.mostrarToast('No se pudieron cargar los productos del servidor.');
      },
    });
  }

  public abrirLogin(): void {
    this.mostrarLogin = true;
  }

  public cerrarLogin(): void {
    this.mostrarLogin = false;
  }

  public alAutenticar(nombre: string): void {
    this.mostrarLogin = false;
    this.mostrarToast(`¡Hola, ${nombre}!`);
  }

  public cerrarSesion(): void {
    this.loginService.logout();
    this.mostrarLogin = false;
    this.mostrarToast('Sesión cerrada correctamente.');
  }

  public aplicarFiltrosBusquedas(): void {
    let resultado = [...this.productos];

    // Filtro por categoría ignorando tildes y mayúsculas
    if (this.categoriaActiva !== 'Todos') {
      const catBuscada = this.sinTildes(this.categoriaActiva);
      resultado = resultado.filter(
        (p) => this.sinTildes(p.categoria) === catBuscada,
      );
    }

    // Filtro por texto de búsqueda
    if (this.busqueda.trim() !== '') {
      const textoBuscado = this.busqueda.toLowerCase();

      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(textoBuscado) ||
          p.descripcion.toLowerCase().includes(textoBuscado),
      );
    }

    // Ordenamiento de resultados
    if (this.orden === 'precio-menor') {
      resultado = resultado.sort((a, b) => a.precio - b.precio);
    } else if (this.orden === 'precio-mayor') {
      resultado = resultado.sort((a, b) => b.precio - a.precio);
    } else if (this.orden === 'rating') {
      resultado = resultado.sort((a, b) => b.rating - a.rating);
    }

    this.productosFiltrados = resultado;
  }

  public filtrarPorCategoria(categoria: string): void {
    this.categoriaActiva = categoria;
    this.aplicarFiltrosBusquedas();
  }

  public mostrarToast(mensaje: string): void {
    this.mensajeToast = mensaje;

    setTimeout(() => {
      this.mensajeToast = null;
    }, 3000);
  }

  public agregarAlCarritoDeCompras(producto: Product): void {
    if (!this.carritoService.agregar(producto)) {
      this.mostrarToast(`No hay más stock disponible de "${producto.nombre}".`);
      return;
    }
    this.mostrarToast(`Se ha agregado "${producto.nombre}" al carrito de compras.`);
  }

  public cantidadEnCarrito(productoId: number): number {
    return this.carritoService.items().find((item) => item.producto.id === productoId)?.cantidad ?? 0;
  }

  public puedeAgregar(producto: Product): boolean {
    return producto.stock > this.cantidadEnCarrito(producto.id);
  }

  private sinTildes(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
