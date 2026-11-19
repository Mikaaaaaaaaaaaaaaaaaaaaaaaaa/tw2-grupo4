export const SORTS = [
  'destacados',
  'precio-menor',
  'precio-mayor',
] as const;

export type SortProductos = (typeof SORTS)[number];

export interface QueryProductos {
  page?: unknown;
  limit?: unknown;
  category?: unknown;
  search?: unknown;
  sort?: unknown;
}

export interface FiltrosProductosNormalizados {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  sort: SortProductos;
}

export interface ResultadoFiltrosProductos {
  valido: boolean;
  filtros?: FiltrosProductosNormalizados;
  errores: Array<{ campo: string; mensaje: string }>;
}

function valorTexto(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  const texto = valor.trim();
  return texto !== '' ? texto : undefined;
}

function enteroPositivo(
  valor: unknown,
  campo: 'page' | 'limit',
  defecto: number,
  errores: Array<{ campo: string; mensaje: string }>,
): number {
  if (valor === undefined) return defecto;

  const texto = valorTexto(valor);
  const numero = texto === undefined ? Number.NaN : Number(texto);

  if (!Number.isInteger(numero)) {
    errores.push({
      campo,
      mensaje: `${campo} debe ser un entero.`,
    });
  }

  return numero;
}

export function validarYNormalizarFiltrosProductos(
  query: QueryProductos,
): ResultadoFiltrosProductos {
  const errores: Array<{ campo: string; mensaje: string }> = [];
  const page = enteroPositivo(query.page, 'page', 1, errores);
  const limit = enteroPositivo(query.limit, 'limit', 25, errores);
  const category = valorTexto(query.category);
  const search = valorTexto(query.search);
  const sort = valorTexto(query.sort) ?? 'destacados';

  if (Number.isInteger(page) && page < 1) {
    errores.push({
      campo: 'page',
      mensaje: 'page debe ser mayor o igual a 1.',
    });
  }

  if (Number.isInteger(limit) && (limit < 1 || limit > 25)) {
    errores.push({
      campo: 'limit',
      mensaje: 'limit debe estar entre 1 y 25.',
    });
  }

  if (!SORTS.includes(sort as SortProductos)) {
    errores.push({
      campo: 'sort',
      mensaje: 'sort debe ser destacados, precio-menor o precio-mayor.',
    });
  }

  if (errores.length > 0) {
    return { valido: false, errores };
  }

  return {
    valido: true,
    filtros: {
      page,
      limit,
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
      sort: sort as SortProductos,
    },
    errores: [],
  };
}
