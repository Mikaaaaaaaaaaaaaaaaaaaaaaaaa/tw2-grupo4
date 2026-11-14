import { prisma } from "../config/db";
import { HttpError } from "../common/errors";

export interface ItemInput {
  productId: number;
  quantity: number;
}

const orderInclude = {
  order_items: { include: { products: { select: { title: true } } } },
} as const;

export type OrderRow = Awaited<ReturnType<typeof findOrdersByUser>>[number];

export function createOrder(userId: number, items: ItemInput[]) {
  return prisma.$transaction(async (tx) => {
    const products = await tx.products.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines: { product_id: number; quantity: number; unit_price: number }[] = [];
    let totalCents = 0;

    for (const { productId, quantity } of items) {
      const product = byId.get(productId);
      if (!product) throw new HttpError(400, `El producto ${productId} no existe`);

      const { count } = await tx.products.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) throw new HttpError(400, `Sin stock suficiente para "${product.title}"`);

      const unitPrice = Number(product.price);
      lines.push({ product_id: productId, quantity, unit_price: unitPrice });
      totalCents += Math.round(unitPrice * 100) * quantity;
    }

    return tx.orders.create({
      data: { user_id: userId, total: totalCents / 100, order_items: { create: lines } },
      include: orderInclude,
    });
  });
}

export function findOrdersByUser(userId: number) {
  return prisma.orders.findMany({
    where: { user_id: userId },
    include: orderInclude,
    orderBy: { id: "desc" },
  });
}