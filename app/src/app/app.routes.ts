import { Routes } from '@angular/router';
import { Catalogo } from './components/catalogo/catalogo';
import { Detalle } from './components/detalle/detalle';
import { Pedidos } from './components/pedidos/pedidos';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
{ path: 'productos/nuevo', canActivate: [authGuard], loadComponent: () => import('./pages/cargar-producto/cargar-producto').then((m) => m.CargarProducto) },
    { path: '', component: Catalogo, children: [
        { path: 'producto/:id', component: Detalle }
    ] },
    { path: 'catalogo', component: Catalogo },
{ path: 'mis-pedidos', component: Pedidos, canActivate: [authGuard] }];
