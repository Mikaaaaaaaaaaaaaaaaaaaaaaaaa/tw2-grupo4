import { Component, OnInit } from '@angular/core';
import { Subject, switchMap } from 'rxjs';
import { Product } from '../../models/product';
import { ProductoService } from '../../services/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Login } from '../login/login';
import { Nav } from '../../nav/nav';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';
import { CATEGORIAS, type Categoria } from '../../models/categorias.const';

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
  public readonly categorias = CATEGORIAS;
  public categoriaActiva: Categoria | 'Todos' = 'Todos';
  public busqueda: string = '';
  public orden: 'destacados' | 'precio-menor' | 'precio-mayor' = 'destacados';
  public paginaActual = 1;
  public totalPaginas = 0;
  private readonly solicitudesCatalogo = new Subject<{
    page: number;
    limit: number;
    category?: string;
    search?: string;
    sort: 'destacados' | 'precio-menor' | 'precio-mayor';
  }>();

  public mensajeToast: string | null = null;

  public constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private loginService: LoginService,
  ) {}

  public ngOnInit(): void {
    this.categoriaActiva = 'Todos';
    this.busqueda = '';
    this.paginaActual = 1;

    this.solicitudesCatalogo.pipe(
      switchMap((parametros) =>
        this.productoService.cargarProductos(true, parametros),
      ),
    ).subscribe({
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

    this.cargarDesdeBackend();
  }

  public cargarDesdeBackend(): void {
    this.solicitudesCatalogo.next({
      page: this.paginaActual,
      limit: 25,
      ...(this.categoriaActiva !== 'Todos'
        ? { category: this.categoriaActiva }
        : {}),
      ...(this.busqueda.trim() ? { search: this.busqueda.trim() } : {}),
      sort: this.orden,
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

  public filtrarPorCategoria(categoria: Categoria | 'Todos'): void {
    if (categoria === 'Todos') {
      this.categoriaActiva = 'Todos';
      this.paginaActual = 1;
      this.cargarDesdeBackend();
      return;
    }

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
