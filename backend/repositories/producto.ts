import { prisma } from "../config/db";
import type { DatosProducto } from "../validations/producto";

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
