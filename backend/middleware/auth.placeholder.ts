import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../common/errors";

// TEMPORAL: acepta "Bearer dev-<userId>". Se reemplaza por el JWT real.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const id = /^Bearer dev-(\d+)$/.exec(req.header("authorization") ?? "")?.[1];
  if (!id) return next(new HttpError(401, "No autorizado"));
  req.user = { id: Number(id) };
  next();
}