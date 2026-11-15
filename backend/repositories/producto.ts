import { prisma } from "../config/db";
import type { DatosProducto } from "../validations/producto";

export interface FiltrosProductos {
  category?: string;
  q?: string;
}

export async function listar(filtros?: FiltrosProductos) {
  const where: any = {};

  if (filtros?.category) {
    where.category = filtros.category;
  }

  if (filtros?.q) {
    where.OR = [
      { title: { contains: filtros.q } },
      { description: { contains: filtros.q } },
    ];
  }

  return prisma.products.findMany({
    where,
    orderBy: { id: "asc" },
  });
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
