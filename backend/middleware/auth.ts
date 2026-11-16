import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ROLES, type Rol } from "../models/rol.model";

export interface AuthenticatedRequest extends Request {
  usuarioId: number;
  usuarioRol: Rol;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    res.status(401).json({ message: "Token requerido" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const usuarioId = Number(payload.id);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      res.status(401).json({ message: "Token inválido" });
      return;
    }

    const request = req as AuthenticatedRequest;
    request.usuarioId = usuarioId;
    request.usuarioRol = payload.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}

export function requireRol(...rolesPermitidos: Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { usuarioRol } = req as AuthenticatedRequest;

    if (!rolesPermitidos.includes(usuarioRol)) {
      res.status(403).json({ message: "No tenés permisos para realizar esta acción" });
      return;
    }

    next();
  };
}