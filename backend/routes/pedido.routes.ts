import { Router } from "express";
import { crearPedido, listarPedidos } from "../controllers/pedido";
import { requireAuth } from "../middleware/auth";

const pedidoRouter = Router();

pedidoRouter.use(requireAuth);
pedidoRouter.post("/", crearPedido);
pedidoRouter.get("/", listarPedidos);

export default pedidoRouter;
