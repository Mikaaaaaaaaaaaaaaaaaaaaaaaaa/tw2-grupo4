import { Component } from '@angular/core';
import { Product } from '../../models/product';
import { ProductoService } from '../../services/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Login } from '../login/login';
import { Carrito } from '../../carrito/carrito';
import { Nav } from '../../nav/nav';
import { CarritoService } from '../../services/carrito';

@Component({
  imports: [FormsModule, CommonModule, RouterModule, Login, Carrito, Nav],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  public productos: Product[] = [];
  public productosFiltrados: Product[] = [];
  public mostrarLogin: boolean = false;
  public usuarioActual: string | null = null;

  public categorias: string[] = ['Todos', 'Laptops', 'Perifericos', 'Audio'];
  public categoriaActiva: string = 'Todos';
  public busqueda: string = '';
  public orden: string = 'Destacados';

  public mensajeToast: string | null = null;

  public constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
  ) {}

  public ngOnInit(): void {
    this.productos = this.productoService.obtenerTodosProductos();
    this.aplicarFiltrosBusquedas();
  }

  public abrirLogin(): void {
    this.mostrarLogin = true;
  }

  public cerrarLogin(): void {
    this.mostrarLogin = false;
  }

  public Ingresar(datos: { email: string; password: string; recordar: boolean }): void {
    this.usuarioActual = datos.email.split('@')[0];
    this.mostrarLogin = false;
    this.mostrarToast(`¡Bienvenido de nuevo, ${this.usuarioActual}!`);
  }

  public Registrar(datos: { nombre: string; email: string; password: string }): void {
    this.usuarioActual = datos.nombre;
    this.mostrarLogin = false;
    this.mostrarToast(`¡Cuenta creada con éxito! Hola, ${datos.nombre}.`);
  }

  public cerrarSesion(): void {
    this.usuarioActual = null;
    this.mostrarLogin = false;
    this.mostrarToast('Sesión cerrada correctamente.');
  }

  public aplicarFiltrosBusquedas(): void {
    let resultado = [...this.productos];

    // Filtro por categoria.
    if (this.categoriaActiva !== 'Todos') {
      resultado = resultado.filter(
        (p) => p.categoria.toLowerCase() === this.categoriaActiva.toLowerCase(),
      );
    }

    // Filtro por texto de busqueada.
    if (this.busqueda.trim() !== '') {
      const textoBuscado = this.busqueda.toLowerCase();

      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(textoBuscado) ||
          p.descripcion.toLowerCase().includes(textoBuscado),
      );
    }

    // Ordenamiento de resultados.
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
    this.carritoService.agregar(producto);
    this.mostrarToast(`Se ha agregado \"${producto.nombre}\" al carrito de compras.`);
  }
}
