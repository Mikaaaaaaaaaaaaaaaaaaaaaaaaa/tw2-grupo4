import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface ParametrosProductos {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: 'precio-menor' | 'precio-mayor';
}

export interface RespuestaPaginadaApiDto {
  data: ProductoApiDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  readonly paginacion = signal({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  /**
   * Pide todos los productos al backend (GET /api/products)
   */
  public cargarProductos(
    forzarRecarga = false,
    parametros: ParametrosProductos = {},
  ): Observable<Product[]> {
    const hayParametros = Object.keys(parametros).length > 0;

    if (!forzarRecarga && !hayParametros && this.productos().length > 0) {
      return of(this.productos());
    }

    this.cargando.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (parametros.page !== undefined) params = params.set('page', parametros.page);
    if (parametros.limit !== undefined) params = params.set('limit', parametros.limit);
    if (parametros.category) params = params.set('category', parametros.category);
    if (parametros.search) params = params.set('search', parametros.search);
    if (parametros.sort) params = params.set('sort', parametros.sort);

    return this.http.get<RespuestaPaginadaApiDto>(this.apiUrl, { params }).pipe(
      map((respuesta) => ({
        productos: respuesta.data.map((item) =>
          this.traducirDesdeApi(item),
        ),
        paginacion: {
          total: respuesta.total,
          page: respuesta.page,
          limit: respuesta.limit,
          totalPages: respuesta.totalPages,
        },
      })),
      tap((resultado) => {
        this.productos.set(resultado.productos);
        this.paginacion.set(resultado.paginacion);
        this.cargando.set(false);
      }),
      map((resultado) => resultado.productos),
      catchError((err: unknown) => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar los productos desde el servidor.');
        return throwError(() => err);
      }),
    );
  }

  /**
   * Consulta el estado actual del producto en el backend antes de mostrarlo.
   */
  public obtenerPorId$(id: number): Observable<Product | undefined> {
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

  public darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.productos.update((productos) => productos.filter((p) => p.id !== id))),
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
      stock: producto.stock,
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
