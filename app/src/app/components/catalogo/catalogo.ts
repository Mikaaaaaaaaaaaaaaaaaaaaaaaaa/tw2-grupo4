import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ProductoService } from '../../services/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Login } from '../login/login';
import { Nav } from '../../nav/nav';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';

@Component({
  imports: [FormsModule, CommonModule, RouterModule, Login, Nav],
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
  public get esAdmin(): boolean {
  return this.loginService.esAdmin();
}
  public categorias: string[] = ['Todos', 'Laptops', 'Perifericos', 'Audio', 'Componentes'];
  public categoriaActiva: string = 'Todos';
  public busqueda: string = '';
  public orden: 'destacados' | 'precio-menor' | 'precio-mayor' = 'destacados';
  public paginaActual = 1;
  public totalPaginas = 0;

  public mensajeToast: string | null = null;

  public constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private loginService: LoginService,
  ) {}

  public ngOnInit(): void {
    this.cargarDesdeBackend();
  }

  public cargarDesdeBackend(): void {
    this.productoService.cargarProductos(true, {
      page: this.paginaActual,
      limit: 25,
      ...(this.categoriaActiva !== 'Todos'
        ? {
            category:
              this.categoriaActiva === 'Perifericos'
                ? 'Periféricos'
                : this.categoriaActiva,
          }
        : {}),
      ...(this.busqueda.trim() ? { search: this.busqueda.trim() } : {}),
      sort: this.orden,
    }).subscribe({
      next: (lista) => {
        this.productos = lista;
        this.productosFiltrados = lista;
        const paginacion = this.productoService.paginacion();
        this.paginaActual = paginacion.page;
        this.totalPaginas = paginacion.totalPages;
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
    this.paginaActual = 1;
    this.cargarDesdeBackend();
  }

  public filtrarPorCategoria(categoria: string): void {
    this.categoriaActiva = categoria;
    this.aplicarFiltrosBusquedas();
  }

  public cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarDesdeBackend();
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

}
