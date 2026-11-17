import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
    crearProducto,
    listarProductos,
    obtenerProductoPorId,
} from "../controllers/producto";

const productoRouter = Router();

productoRouter.get("/", listarProductos);
productoRouter.get("/:id", obtenerProductoPorId);
productoRouter.post("/", requireAuth, crearProducto);

export default productoRouter;