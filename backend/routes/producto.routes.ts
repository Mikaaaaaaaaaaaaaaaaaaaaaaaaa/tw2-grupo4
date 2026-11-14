import { Router } from "express";
import { crearProducto } from "../controllers/producto";

const productoRouter = Router();

productoRouter.post("/", crearProducto);

export default productoRouter;
