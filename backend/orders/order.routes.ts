import { Router } from "express";
import { requireAuth, requireRol } from "../middleware/auth";
import { ROLES } from "../models/rol.model";
import { crear, listar } from "./order.controller";

export const orderRouter = Router();
orderRouter.post("/", requireAuth, requireRol(ROLES.USER), crear);
orderRouter.get("/", requireAuth, requireRol(ROLES.USER), listar);