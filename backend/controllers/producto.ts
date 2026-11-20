import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import {
    crearProducto as crearProductoEnServicio,
    listarProductos as listarProductosEnServicio,
    obtenerProductoPorId as obtenerProductoPorIdEnServicio,
    ErrorValidacion,
} from "../services/producto";
import { validarYNormalizarFiltrosProductos } from "../validations/productos-filtros";

export async function listarProductos(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const resultado = validarYNormalizarFiltrosProductos(req.query);

        if (!resultado.valido) {
            res.status(400).json({ errores: resultado.errores });
            return;
        }

        const respuesta = await listarProductosEnServicio(resultado.filtros!);
        res.json(respuesta);
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

        const resultado = await obtenerProductoPorIdEnServicio(id);

        if ('error' in resultado) {
            if (resultado.error === 'ID_INVALIDO') {
                res.status(400).json({ message: "ID inválido" });
                return;
            }

            if (resultado.error === 'PRODUCTO_NO_ENCONTRADO') {
                res.status(404).json({ message: "Producto no encontrado" });
                return;
            }
        }

        res.json(resultado);
        } catch (error) {
        next(error);
    }

    //     if (!Number.isInteger(id) || id <= 0) {
    //         res.status(400).json({ message: "ID inválido" });
    //         return;
    //     }

    //     const producto = await prisma.products.findUnique({
    //         where: { id },
    //     });

    //     if (!producto) {
    //         res.status(404).json({ message: "Producto no encontrado" });
    //         return;
    //     }

    //     res.json({
    //         ...producto,
    //         price: Number(producto.price),
    //         stock: producto.stock,
    //         rating: producto.rating !== null ? Number(producto.rating) : null,
    //     });
    // } catch (error) {
    //     next(error);
    // }
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