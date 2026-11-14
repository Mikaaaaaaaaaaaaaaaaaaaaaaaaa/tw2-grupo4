import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  usuarioId: number;
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

    (req as AuthenticatedRequest).usuarioId = usuarioId;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}
