import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import type { AuthenticatedRequest } from "../middleware/auth";

interface ItemBody {
  productId: number;
  quantity: number;
}

class StockInsuficiente extends Error {
  constructor(
    public readonly nombre: string,
    public readonly disponible: number,
  ) {
    super("StockInsuficiente");
  }
}

function mapearPedido(pedido: {
  id: number;
  user_id: number;
  total: unknown;
  fecha: Date;
  order_items: Array<{
    product_id: number;
    quantity: number;
    unit_price: unknown;
  }>;
}) {
  return {
    id: pedido.id,
    userId: pedido.user_id,
    total: Number(pedido.total),
    date: pedido.fecha.toISOString().slice(0, 10),
    items: pedido.order_items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
  };
}

function obtenerItems(body: unknown): ItemBody[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { items?: unknown }).items)) {
    return null;
  }

  const items = (body as { items: unknown[] }).items;
  if (
    items.length === 0 ||
    items.some((item) => {
      if (!item || typeof item !== "object") return true;
      const value = item as Partial<ItemBody>;
      return (
        !Number.isInteger(value.productId) ||
        Number(value.productId) <= 0 ||
        !Number.isInteger(value.quantity) ||
        Number(value.quantity) <= 0
      );
    })
  ) {
    return null;
  }

  return items as ItemBody[];
}

export async function crearPedido(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const items = obtenerItems(req.body);
    if (!items) {
      res.status(400).json({ message: "Los ítems del pedido son inválidos" });
      return;
    }

    const repetidos = new Set<number>();
    if (items.some((item) => repetidos.has(item.productId) || !repetidos.add(item.productId))) {
      res.status(400).json({ message: "No se permiten productos repetidos" });
      return;
    }

    const usuarioId = (req as AuthenticatedRequest).usuarioId;
    const pedido = await prisma.$transaction(async (tx) => {
      const productos = await tx.products.findMany({
        where: { id: { in: items.map((item) => item.productId) } },
      });

      if (productos.length !== items.length) {
        throw new Error("ProductoNoEncontrado");
      }

      const porId = new Map(productos.map((producto) => [producto.id, producto]));
      let total = 0;
      for (const item of items) {
        const producto = porId.get(item.productId)!;
        if (producto.stock < item.quantity) {
          throw new StockInsuficiente(producto.title, producto.stock);
        }
        total += Number(producto.price) * item.quantity;
      }

      const creado = await tx.orders.create({
        data: {
          user_id: usuarioId,
          total,
          order_items: {
            create: items.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
              unit_price: porId.get(item.productId)!.price,
            })),
          },
        },
        include: { order_items: true },
      });

      for (const item of items) {
        const actualizado = await tx.products.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (actualizado.count !== 1) {
          const producto = await tx.products.findUnique({
            where: { id: item.productId },
          });
          throw new StockInsuficiente(
            producto?.title ?? "Producto",
            producto?.stock ?? 0,
          );
        }
      }

      return creado;
    });

    res.status(201).json(mapearPedido(pedido));
  } catch (error) {
    if (error instanceof Error && error.message === "ProductoNoEncontrado") {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }
    if (error instanceof StockInsuficiente) {
      res.status(400).json({
        message: `Stock insuficiente para ${error.nombre} (disponible: ${error.disponible})`,
      });
      return;
    }
    next(error);
  }
}

export async function listarPedidos(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pedidos = await prisma.orders.findMany({
      where: { user_id: (req as AuthenticatedRequest).usuarioId },
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      include: { order_items: true },
    });
    res.json(pedidos.map(mapearPedido));
  } catch (error) {
    next(error);
  }
}
