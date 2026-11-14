import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { NuevoPedido, Pedido } from '../models/pedido';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pedidos`;
  private readonly listaPedidos = signal<Pedido[]>([]);

  public readonly pedidos = this.listaPedidos.asReadonly();

  public cargarPedidos() {
    return this.http.get<Pedido[]>(this.url).pipe(
      tap((pedidos) => this.listaPedidos.set(pedidos)),
    );
  }

  public crearPedido(nuevo: NuevoPedido) {
    return this.http.post<Pedido>(this.url, nuevo).pipe(
      tap((pedido) => this.listaPedidos.update((lista) => [pedido, ...lista])),
    );
  }
}
