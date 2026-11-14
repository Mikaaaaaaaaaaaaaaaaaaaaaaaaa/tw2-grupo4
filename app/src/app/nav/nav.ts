import { Component } from '@angular/core';
import { Carrito } from '../carrito/carrito';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [Carrito, RouterLink, RouterLinkActive],
  selector: 'app-nav',
  styleUrl: './nav.css',
  templateUrl: './nav.html',
})
export class Nav {
}
