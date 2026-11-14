import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido';
import { Nav } from '../../nav/nav';

@Component({
  imports: [RouterLink, DatePipe, DecimalPipe, Nav],
  selector: 'app-pedidos',
  templateUrl: './pedidos.html',
  host: { class: 'block' },
})
export class Pedidos implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  public readonly pedidos = this.pedidoService.pedidos;
  public readonly cargando = this.pedidoService.cargando;
  public readonly error = this.pedidoService.error;

  public ngOnInit(): void {
    this.pedidoService.cargar();
  }
}
