import type { AuthenticatedRequest } from "../middleware/auth";
import type { Request, Response } from "express";
import * as service from "./order.service";

export async function crear(req: Request, res: Response) {
  res.status(201).json(await service.crear((req as AuthenticatedRequest).usuarioId, req.body));
}

export async function listar(req: Request, res: Response) {
  res.status(200).json(await service.listar((req as AuthenticatedRequest).usuarioId));
}