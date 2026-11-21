import { Routes } from '@angular/router';
import { Catalogo } from './components/catalogo/catalogo';
import { Detalle } from './components/detalle/detalle';
import { Pedidos } from './components/pedidos/pedidos';
import { Checkout } from './components/checkout/checkout';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { clienteGuard } from './guards/cliente.guard';

export const routes: Routes = [
  {
    path: 'productos/nuevo',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/cargar-producto/cargar-producto').then(
        (m) => m.CargarProducto,
      ),
  },
  {
    path: 'productos/:id/editar',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/cargar-producto/cargar-producto').then(
        (m) => m.CargarProducto,
      ),
  },
  {
    path: '',
    component: Catalogo,
    children: [{ path: 'producto/:id', component: Detalle }],
  },
  { path: 'catalogo', component: Catalogo },
  { path: 'mis-pedidos', component: Pedidos, canActivate: [authGuard, clienteGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard, clienteGuard] },
  {
    path: 'restablecer',
    loadComponent: () =>
      import('./components/restablecer/restablecer').then((m) => m.Restablecer),
  },
];