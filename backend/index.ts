import "dotenv/config";
import express from "express";
import { prisma } from "./config/db";

const app = express();
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    res.json({ status: "ok", database: "conectada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", database: "sin conexion" });
  }
});

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});