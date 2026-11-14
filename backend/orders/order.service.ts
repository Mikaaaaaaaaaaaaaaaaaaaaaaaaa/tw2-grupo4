import { HttpError } from "../common/errors";
import { createOrder, findOrdersByUser, type ItemInput, type OrderRow } from "./order.repository";

function toDto(o: OrderRow) {
  return {
    id: o.id,
    userId: o.user_id,
    total: Number(o.total),
    date: o.fecha.toISOString(),
    items: o.order_items.map((i) => ({
      productId: i.product_id,
      productName: i.products.title,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
    })),
  };
}

function parseItems(body: unknown): ItemInput[] {
  const raw = (body as { items?: unknown } | undefined)?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new HttpError(400, "El pedido debe tener al menos un item");
  }
  const merged = new Map<number, number>();
  for (const item of raw) {
    const { productId, quantity } = (item ?? {}) as Record<string, unknown>;
    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      (productId as number) < 1 ||
      (quantity as number) < 1
    ) {
      throw new HttpError(400, "Cada item necesita productId y quantity enteros mayores a 0");
    }
    merged.set(productId as number, (merged.get(productId as number) ?? 0) + (quantity as number));
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

export async function crear(userId: number, body: unknown) {
  return toDto(await createOrder(userId, parseItems(body)));
}

export async function listar(userId: number) {
  return (await findOrdersByUser(userId)).map(toDto);
}