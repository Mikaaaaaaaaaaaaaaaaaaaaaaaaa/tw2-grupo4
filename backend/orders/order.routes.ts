import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { crear, listar } from "./order.controller";

export const orderRouter = Router();
orderRouter.post("/", requireAuth, crear);
orderRouter.get("/", requireAuth, listar);