import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Product } from '../models/product';
import { Producto } from '../models/producto.interface';
import { environment } from '../../environments/environment';

// Así es como vienen los datos desde el backend (en inglés)
export interface ProductoApiDto {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number | string;
  stock?: number | string;
  rating?: number | string;
  image?: string | null;
}

const IMAGEN_POR_DEFECTO =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  // Estados reactivos para que las pantallas se enteren cuando cargan los datos
  readonly productos = signal<Product[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Pide todos los productos al backend (GET /api/products)
   */
  public cargarProductos(forzarRecarga = false): Observable<Product[]> {
    if (!forzarRecarga && this.productos().length > 0) {
      return of(this.productos());
    }

    this.cargando.set(true);
    this.error.set(null);

    return this.http.get<ProductoApiDto[]>(this.apiUrl).pipe(
      map((listaApi) => listaApi.map((item) => this.traducirDesdeApi(item))),
      tap((listaTraducida) => {
        this.productos.set(listaTraducida);
        this.cargando.set(false);
      }),
      catchError((err: unknown) => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar los productos desde el servidor.');
        return throwError(() => err);
      }),
    );
  }

  /**
   * Busca un producto por ID: primero en memoria y si no está, le pregunta al backend
   */
  public obtenerPorId$(id: number): Observable<Product | undefined> {
    const enMemoria = this.productos().find((p) => p.id === id);
    if (enMemoria) {
      return of(enMemoria);
    }

    return this.http.get<ProductoApiDto>(`${this.apiUrl}/${id}`).pipe(
      map((item) => this.traducirDesdeApi(item)),
      catchError(() =>
        // Si el backend no tiene ruta GET /products/:id, traemos todos y buscamos el ID
        this.cargarProductos(true).pipe(
          map((lista) => lista.find((p) => p.id === id)),
          catchError(() => of(undefined)),
        ),
      ),
    );
  }

  /**
   * Envía un producto nuevo al backend (POST /api/products) y lo suma al catálogo
   */
  public crear(producto: Producto): Observable<Product> {
    const cuerpoParaApi = {
      title: producto.nombre,
      description: producto.descripcion,
      category: producto.clasificacion,
      price: producto.precio,
      stock: 10,
      ...(producto.imagen ? { image: producto.imagen } : {}),
    };

    return this.http.post<ProductoApiDto>(this.apiUrl, cuerpoParaApi).pipe(
      map((itemCreado) => this.traducirDesdeApi(itemCreado)),
      tap((nuevoProducto) => {
        this.productos.update((actuales) => [...actuales, nuevoProducto]);
      }),
    );
  }

  // Métodos viejos por compatibilidad
  public obtenerTodosProductos(): Product[] {
    return this.productos();
  }

  public obtenerPorId(id: number): Product | undefined {
    return this.productos().find((p) => p.id === id);
  }

  // Traductor de Inglés (Backend) -> Español (Frontend)
  private traducirDesdeApi(dto: ProductoApiDto): Product {
    return {
      id: Number(dto.id),
      nombre: dto.title,
      descripcion: dto.description,
      categoria: dto.category,
      precio: Number(dto.price ?? 0),
      stock: Number(dto.stock ?? 10),
      rating: Number(dto.rating ?? 4.5),
      imagen: dto.image?.trim() ? dto.image : IMAGEN_POR_DEFECTO,
    };
  }
}
