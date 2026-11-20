import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  role: 'USER' | 'ADMIN';
  token: string;
}

const CLAVE = 'techstore.usuario';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth`;

  private readonly usuarioSignal = signal<Usuario | null>(this.cargar());
  readonly usuario = this.usuarioSignal.asReadonly();
  readonly esAdmin = computed(() => this.usuarioSignal()?.role === 'ADMIN');
  private readonly modalLoginSignal = signal(false);
  readonly modalLoginAbierto = this.modalLoginSignal.asReadonly();

  abrirModalLogin(): void {
    this.modalLoginSignal.set(true);
  }

  cerrarModalLogin(): void {
    this.modalLoginSignal.set(false);
  }

  login(email: string, password: string) {
    return this.http
      .post<Usuario>(`${this.url}/login`, { email, password })
      .pipe(tap((u) => this.guardar(u)));
  }

  registrar(datos: {
    nombre: string;
    apellido: string;
    direccion: string;
    email: string;
    password: string;
  }) {
    return this.http.post<Usuario>(`${this.url}/register`, datos).pipe(tap((u) => this.guardar(u)));
  }

  logout(): void {
    localStorage.removeItem(CLAVE);
    this.usuarioSignal.set(null);
  }

  private guardar(u: Usuario): void {
    localStorage.setItem(CLAVE, JSON.stringify(u));
    this.usuarioSignal.set(u);
  }

  private cargar(): Usuario | null {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) ?? 'null');
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return this.usuarioSignal()?.token ?? null;
  }

  recuperar(email: string) {
    return this.http.post<{ message: string }>(`${this.url}/recuperar`, { email });
  }

  restablecer(token: string, password: string) {
    return this.http.post<{ message: string }>(`${this.url}/restablecer`, { token, password });
  }
}
