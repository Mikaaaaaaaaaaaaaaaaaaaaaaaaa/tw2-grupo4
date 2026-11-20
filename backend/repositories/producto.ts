import { prisma } from "../config/db";
import type { DatosProducto } from "../validations/producto";
import type { FiltrosProductosNormalizados } from "../validations/productos-filtros";

export type FiltrosProductos = FiltrosProductosNormalizados;

function normalizarTexto(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function listar(filtros: FiltrosProductos) {
  const orderBy =
    filtros.sort === "precio-menor"
      ? { price: "asc" as const }
      : filtros.sort === "precio-mayor"
        ? { price: "desc" as const }
        : { id: "asc" as const };

  const productos = await prisma.products.findMany({
    orderBy,
  });

  const categoriaBuscada = filtros.category
    ? normalizarTexto(filtros.category)
    : undefined;
  const textoBusqueda = filtros.search
    ? normalizarTexto(filtros.search)
    : undefined;
  const dataFiltrada = productos.filter((producto) => {
    const coincideCategoria = categoriaBuscada === undefined
      || normalizarTexto(producto.category) === categoriaBuscada;
    const coincideBusqueda = textoBusqueda === undefined
      || normalizarTexto(producto.title).includes(textoBusqueda)
      || normalizarTexto(producto.description ?? '').includes(textoBusqueda)
      || normalizarTexto(producto.category).includes(textoBusqueda);

    return coincideCategoria && coincideBusqueda;
  });
  const data = dataFiltrada.slice(
    (filtros.page - 1) * filtros.limit,
    filtros.page * filtros.limit,
  );

  return { data, total: dataFiltrada.length };
}

export async function crear(producto: DatosProducto) {
  return prisma.products.create({
    data: {
      title: producto.title,
      description: producto.description,
      category: producto.category,
      price: producto.price,
      stock: producto.stock,
      ...(producto.image !== undefined
        ? { image: producto.image }
        : {}),
    },
  });
}

export async function obtenerPorId(id: number) {
  return prisma.products.findUnique({
    where: { id },
  });
}