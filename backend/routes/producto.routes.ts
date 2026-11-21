import { Router } from "express";
import {
    crearProducto,
    darDeBajaProducto,
    listarProductos,
    obtenerProductoPorId,
} from "../controllers/producto";
import { requireAuth, requireRol } from "../middleware/auth";
import { ROLES } from "../models/rol.model";


const productoRouter = Router();

productoRouter.get("/", listarProductos);
productoRouter.get("/:id", obtenerProductoPorId);
productoRouter.post("/", requireAuth, requireRol(ROLES.ADMIN), crearProducto);
productoRouter.delete("/:id", requireAuth, requireRol(ROLES.ADMIN), darDeBajaProducto);

export default productoRouter;