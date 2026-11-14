import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "./config/db";
import authRouter from "./routes/login.routes";
import productoRouter from "./routes/producto.routes";
import cors from "cors";
import { HttpError } from "./common/errors";
import { orderRouter } from "./orders/order.routes";

const app = express();
app.use(cors()); // antes de las rutas
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/products", productoRouter);
app.use("/api/orders", orderRouter);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    res.json({ status: "ok", database: "conectada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", database: "sin conexion" });
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Error interno" });
});

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});