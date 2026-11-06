import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente() {
  const instance = process.env.DB_INSTANCE;

  const sqlConfig = {
    server: process.env.DB_HOST ?? "localhost",
    ...(instance ? {} : { port: Number(process.env.DB_PORT ?? 1433) }),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      ...(instance ? { instanceName: instance } : {}),
    },
  };

  const adapter = new PrismaMssql(sqlConfig);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}