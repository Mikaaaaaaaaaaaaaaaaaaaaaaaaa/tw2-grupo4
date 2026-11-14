import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import {
    crearProducto as crearProductoEnServicio,
    ErrorValidacion,
} from "../services/producto";

export async function listarProductos(
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const productos = await prisma.products.findMany({
            orderBy: { id: "asc" },
        });

        res.json(
            productos.map((p) => ({
                ...p,
                price: Number(p.price),
                stock: p.stock,
                rating: p.rating !== null ? Number(p.rating) : null,
            })),
        );
    } catch (error) {
        next(error);
    }
}

export async function obtenerProductoPorId(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ message: "ID inválido" });
            return;
        }

        const producto = await prisma.products.findUnique({
            where: { id },
        });

        if (!producto) {
            res.status(404).json({ message: "Producto no encontrado" });
            return;
        }

        res.json({
            ...producto,
            price: Number(producto.price),
            stock: producto.stock,
            rating: producto.rating !== null ? Number(producto.rating) : null,
        });
    } catch (error) {
        next(error);
    }
}

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