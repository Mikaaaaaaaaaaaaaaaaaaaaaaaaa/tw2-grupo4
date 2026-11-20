import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '../../models/product';
import { ProductoService } from '../../services/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Nav } from '../../nav/nav';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  imports: [FormsModule, CommonModule, RouterModule],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  public productos: Product[] = [];
  public productosFiltrados: Product[] = [];
  public get usuarioActual(): string | null {
    return this.loginService.usuario()?.nombre ?? null;
  }
  public get esAdmin(): boolean {
  return this.loginService.esAdmin();
}
  public categorias: string[] = ['Todos', 'Laptops', 'Perifericos', 'Audio', 'Componentes'];
  public categoriaActiva: string = 'Todos';
  public busqueda: string = '';
  public orden: '' | 'precio-menor' | 'precio-mayor' = '';
  public limitePorPagina: 12 | 24 = 12;
  public paginaActual = 1;
  public totalPaginas = 0;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly busquedaSubject = new Subject<string>();
  private busquedaAplicada = '';

  public mensajeToast: string | null = null;

  public get hayFiltrosActivos(): boolean {
    return this.categoriaActiva !== 'Todos'
      || this.busqueda.trim() !== ''
      || this.orden !== '';
  }

  public get cargandoProductos(): boolean {
    return this.productoService.cargando();
  }

  public get totalResultados(): number {
    return this.productoService.paginacion().total;
  }

  public get inicioResultados(): number {
    const paginacion = this.productoService.paginacion();
    return paginacion.total === 0
      ? 0
      : (paginacion.page - 1) * paginacion.limit + 1;
  }

  public get finResultados(): number {
    const paginacion = this.productoService.paginacion();
    return paginacion.total === 0
      ? 0
      : Math.min(paginacion.page * paginacion.limit, paginacion.total);
  }

  public constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private loginService: LoginService,
  ) {
    this.loginService.sesionCerrada$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resetearFiltros());

    this.busquedaSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((busqueda) => {
        if (busqueda === this.busquedaAplicada) return;
        this.aplicarFiltrosBusquedas();
      });
  }

  public ngOnInit(): void {
    this.categoriaActiva = 'Todos';
    this.busqueda = '';
    this.paginaActual = 1;
    this.busquedaAplicada = '';
    this.cargarDesdeBackend();
  }

  public cargarDesdeBackend(): void {
    this.productoService.cargarProductos(true, {
      page: this.paginaActual,
       limit: this.limitePorPagina,
      ...(this.categoriaActiva !== 'Todos'
        ? {
            category:
              this.categoriaActiva === 'Perifericos'
                ? 'Periféricos'
                : this.categoriaActiva,
          }
        : {}),
      ...(this.busqueda.trim() ? { search: this.busqueda.trim() } : {}),
      ...(this.orden ? { sort: this.orden } : {}),
    }).subscribe({
   next: (lista) => {
     this.productos = lista;
     this.productosFiltrados = lista;
     const paginacion = this.productoService.paginacion();
     this.paginaActual = paginacion.page;
     this.totalPaginas = paginacion.totalPages;
     this.cdr.markForCheck();
   },
      error: () => {
        this.mostrarToast('No se pudieron cargar los productos del servidor.');
      },
    });
  }

  public cerrarSesion(): void {
    this.loginService.logout();
    this.mostrarToast('Sesión cerrada correctamente.');
  }

  public resetearFiltros(): void {
    this.categoriaActiva = 'Todos';
    this.busqueda = '';
    this.orden = '';
    this.limitePorPagina = 12;
    this.paginaActual = 1;
    this.cargarDesdeBackend();
  }

  public cambiarLimitePorPagina(limite: number): void {
    if (limite !== 12 && limite !== 24) return;

    this.limitePorPagina = limite;
    this.paginaActual = 1;
    this.cargarDesdeBackend();
  }

  public aplicarFiltrosBusquedas(): void {
    this.busquedaAplicada = this.busqueda;
    this.paginaActual = 1;
    this.cargarDesdeBackend();
  }

  public cambiarBusqueda(busqueda: string): void {
    this.busqueda = busqueda;
    this.busquedaSubject.next(busqueda);
  }

  public aplicarBusquedaInmediata(): void {
    this.aplicarFiltrosBusquedas();
  }

  public filtrarPorCategoria(categoria: string): void {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cargarDesdeBackend();
  }

  public mostrarToast(mensaje: string): void {
    this.mensajeToast = mensaje;

setTimeout(() => {
  this.mensajeToast = null;
  this.cdr.markForCheck();
}, 3000);
  }

  public agregarAlCarritoDeCompras(producto: Product): void {
    if (!this.carritoService.agregar(producto)) {
      this.mostrarToast(`No hay más stock disponible de "${producto.nombre}".`);
      return;
    }
    this.mostrarToast(`Se ha agregado "${producto.nombre}" al carrito de compras.`);
    if (!this.loginService.token) {
      this.loginService.abrirModalLogin();
    }
  }

  public cantidadEnCarrito(productoId: number): number {
    return this.carritoService.items().find((item) => item.producto.id === productoId)?.cantidad ?? 0;
  }

  public puedeAgregar(producto: Product): boolean {
    return producto.stock > this.cantidadEnCarrito(producto.id);
  }

}
