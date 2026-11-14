import type { NextFunction, Request, Response } from "express";
import {
  crearProducto as crearProductoEnServicio,
  ErrorValidacion,
} from "../services/producto";

export async function crearProducto(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const producto = await crearProductoEnServicio(req.body);

    res.status(201).json({
      ...producto,
      price: Number(producto.price),
    });
  } catch (error: unknown) {
    if (error instanceof ErrorValidacion) {
      res.status(400).json({ errores: error.errores });
      return;
    }

    next(error);
  }
}
