import { 
  crear as crearProductoEnRepositorio,
  listar as listarProductosEnRepositorio,
  type FiltrosProductos,
} from "../repositories/producto";

import {
  type DatosProducto,
  type ErrorValidacionProducto,
  validarProducto,
} from "../validations/producto";

export class ErrorValidacion extends Error {
  public readonly errores: ErrorValidacionProducto[];

  public constructor(errores: ErrorValidacionProducto[]) {
    super("Los datos del producto no son válidos.");
    this.name = "ErrorValidacion";
    this.errores = errores;
  }
}

function convertirNumero(valor: unknown): number {
  if (typeof valor === "number") {
    return valor;
  }

  if (typeof valor === "string" && valor.trim() !== "") {
    return Number(valor);
  }

  return Number.NaN;
}

function normalizarProducto(datos: Record<string, unknown>): DatosProducto {
  const image =
    typeof datos.image === "string" ? datos.image.trim() : undefined;

  return {
    title: typeof datos.title === "string" ? datos.title.trim() : "",
    description:
      typeof datos.description === "string" ? datos.description.trim() : "",
    category: typeof datos.category === "string" ? datos.category.trim() : "",
    price: convertirNumero(datos.price),
    stock: convertirNumero(datos.stock),
    ...(image !== undefined ? { image } : {}),
  };
}

export async function crearProducto(datos: unknown) {
  const producto = normalizarProducto(
    typeof datos === "object" && datos !== null
      ? (datos as Record<string, unknown>)
      : {},
  );
  const resultado = validarProducto(producto);

  if (!resultado.valido) {
    throw new ErrorValidacion(resultado.errores);
  }

  return crearProductoEnRepositorio(producto);
}

export async function listarProductos(filtros: FiltrosProductos) {
  const { data, total } = await listarProductosEnRepositorio(filtros);

  return {
    data: data.map((producto) => ({
      id: producto.id,
      title: producto.title,
      description: producto.description,
      price: Number(producto.price),
      category: producto.category,
      image: producto.image ?? null,
      stock: producto.stock,
      rating: producto.rating !== null ? Number(producto.rating) : null,
    })),
    total,
    page: filtros.page,
    limit: filtros.limit,
    totalPages: Math.ceil(total / filtros.limit),
  };
}