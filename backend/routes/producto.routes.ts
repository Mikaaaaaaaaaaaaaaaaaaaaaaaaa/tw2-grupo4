import { Router } from "express";
import {
    crearProducto,
    listarProductos,
    obtenerProductoPorId,
} from "../controllers/producto";

const productoRouter = Router();

productoRouter.get("/", listarProductos);
productoRouter.get("/:id", obtenerProductoPorId);
productoRouter.post("/", crearProducto);

export default productoRouter;