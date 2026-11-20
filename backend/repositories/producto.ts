import { prisma } from "../config/db";
import type { DatosProducto } from "../validations/producto";
import type { FiltrosProductosNormalizados } from "../validations/productos-filtros";

export type FiltrosProductos = FiltrosProductosNormalizados;

export async function listar(filtros: FiltrosProductos) {
  const where: {
    category?: string;
    OR?: Array<
      | { title: { contains: string } }
      | { description: { contains: string } }
    >;
  } = {};

  if (filtros?.category) {
    where.category = filtros.category;
  }

  if (filtros?.search) {
    where.OR = [
      { title: { contains: filtros.search } },
      { description: { contains: filtros.search } },
    ];
  }

  const orderBy =
    filtros.sort === "precio-menor"
      ? { price: "asc" as const }
      : filtros.sort === "precio-mayor"
        ? { price: "desc" as const }
        : { id: "asc" as const };

  const [data, total] = await Promise.all([
    prisma.products.findMany({
      where,
      orderBy,
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    }),
    prisma.products.count({ where }),
  ]);

  return { data, total };
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
