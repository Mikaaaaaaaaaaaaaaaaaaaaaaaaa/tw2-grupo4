import { computed, effect, Injectable, signal } from '@angular/core';

const CLAVE_TEMA = 'techstore.tema';

type Tema = 'claro' | 'oscuro';

@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(this.temaInicial());
  readonly esOscuro = computed(() => this.tema() === 'oscuro');

  constructor() {
    effect(() => {
      const tema = this.tema();
      document.documentElement.classList.toggle('dark', tema === 'oscuro');
      localStorage.setItem(CLAVE_TEMA, tema);
    });
  }

  alternar(): void {
    this.tema.update((tema) => (tema === 'oscuro' ? 'claro' : 'oscuro'));
  }

  private temaInicial(): Tema {
    return localStorage.getItem(CLAVE_TEMA) === 'oscuro' ? 'oscuro' : 'claro';
  }
}
