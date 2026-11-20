import { Component, inject } from '@angular/core';
import { Carrito } from '../carrito/carrito';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginService } from '../services/login';
import { TemaService } from '../services/tema';
import { Login } from '../components/login/login';
@Component({
  imports: [Carrito, RouterLink, RouterLinkActive, Login],
  selector: 'app-nav',
  styleUrl: './nav.css',
  templateUrl: './nav.html',
})
export class Nav {
  protected readonly login = inject(LoginService);
  protected readonly tema = inject(TemaService);

  private router = inject(Router);

  public get nombreUsuario(): string | null {
    return this.login.usuario()?.nombre ?? null;
  }

  public abrirLogin(): void {
    this.login.abrirModalLogin();
  }

  public cerrarLogin(): void {
    this.login.cerrarModalLogin();
  }

  public alAutenticar(): void {
    this.login.cerrarModalLogin();
  }

  public cerrarSesion(): void {
    this.login.logout();
    this.router.navigate(['/']); // si estaba en una página protegida, vuelve al inicio
  }

}
