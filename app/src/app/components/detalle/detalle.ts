import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { Product } from '../../models/product';
import { CarritoService } from '../../services/carrito';
import { LoginService } from '../../services/login';

@Component({
  imports: [RouterLink],
  selector: 'app-detalle',
  styleUrl: './detalle.css',
  templateUrl: './detalle.html',
})
export class Detalle implements OnInit {
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private loginService = inject(LoginService);

  protected readonly esAdmin = this.loginService.esAdmin;

  producto?: Product;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.obtenerPorId$(id).subscribe((prod) => {
      this.producto = prod;
    });
  }

  agregarAlCarrito(): void {
    // El admin no compra, aunque el botón no se muestre
    if (this.esAdmin() || !this.producto) {
      return;
    }

    this.carritoService.agregar(this.producto);
  }
}