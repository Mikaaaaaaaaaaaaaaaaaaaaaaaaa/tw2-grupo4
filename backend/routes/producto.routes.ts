import { Router } from "express";
import {
    crearProducto,
    listarProductos,
    obtenerProductoPorId,
} from "../controllers/producto";
import { requireAuth, requireRol } from "../middleware/auth";
import { ROLES } from "../models/rol.model";


const productoRouter = Router();

productoRouter.get("/", listarProductos);
productoRouter.get("/:id", obtenerProductoPorId);
productoRouter.post("/", requireAuth, requireRol(ROLES.ADMIN), crearProducto);

export default productoRouter;