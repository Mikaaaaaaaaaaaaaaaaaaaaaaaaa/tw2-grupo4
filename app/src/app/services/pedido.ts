import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { NuevoItemPedido, Pedido } from '../models/pedido';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  private readonly listaPedidos = signal<Pedido[]>([]);
  public readonly pedidos = this.listaPedidos.asReadonly();
  public readonly cargando = signal(false);
  public readonly error = signal<string | null>(null);

  public cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.http.get<Pedido[]>(this.apiUrl).subscribe({
      next: (lista) => {
        this.listaPedidos.set(lista);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(
          e.status === 401
            ? 'Iniciá sesión para ver tus pedidos.'
            : 'No pudimos cargar tus pedidos. Intentá de nuevo.',
        );
        this.cargando.set(false);
      },
    });
  }

  public crearPedido(items: NuevoItemPedido[]): Observable<Pedido> {
    return this.http
      .post<Pedido>(this.apiUrl, { items })
      .pipe(tap((pedido) => this.listaPedidos.update((lista) => [pedido, ...lista])));
  }
}
