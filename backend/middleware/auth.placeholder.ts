import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../common/errors";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";

  // Soporta "Bearer dev-<id>" para pruebas manuales
  const devId = /^Bearer dev-(\d+)$/.exec(header)?.[1];
  if (devId) {
    req.user = { id: Number(devId) };
    return next();
  }

  // Valida el JWT real que emite LoginService ({ id, email })
  const token = /^Bearer (.+)$/.exec(header)?.[1];
  if (!token) return next(new HttpError(401, "No autorizado"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    req.user = { id: Number(payload.id) };
    next();
  } catch {
    next(new HttpError(401, "Token inválido o vencido"));
  }
}