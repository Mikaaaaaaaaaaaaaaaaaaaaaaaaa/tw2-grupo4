import { Component, inject } from '@angular/core';
import { Carrito } from '../carrito/carrito';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LoginService } from '../services/login';
@Component({
  imports: [Carrito, RouterLink, RouterLinkActive],
  selector: 'app-nav',
  styleUrl: './nav.css',
  templateUrl: './nav.html',
})
export class Nav {
    protected readonly login = inject(LoginService);
}
