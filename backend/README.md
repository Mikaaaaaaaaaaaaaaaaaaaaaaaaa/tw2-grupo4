# Backend - Tienda (TW2 Grupo 4)

API con Node.js, Express, Prisma 7 y SQL Server.

## Requisitos
- Node.js
- SQL Server con TCP/IP activado, y SSMS
- Modo "SQL Server and Windows Authentication" activado, con un usuario y clave
- Una base de datos llamada `tienda` con las tablas creadas

## Pasos para levantarlo

1. Entrar a la carpeta del backend:
   ```
   cd backend
   ```

2. Instalar las dependencias:
   ```
   npm install
   ```

3. Crear el archivo `.env`: copiar `.env.example`, renombrarlo a `.env` y completar con **tu propio usuario y clave** de SQL Server. El `.env` no se sube a GitHub.

   | Variable | Qué poner |
   |---|---|
   | `PORT` | `3000` |
   | `DATABASE_URL` | Cambiar `TU_USUARIO` y `TU_CLAVE` |
   | `DB_HOST` | `localhost` |
   | `DB_PORT` | `1433` |
   | `DB_USER` | Tu usuario de SQL Server |
   | `DB_PASSWORD` | Tu clave de SQL Server |
   | `DB_NAME` | `tienda` |
   | `DB_INSTANCE` | Solo si usás SQL Server Express: `SQLEXPRESS` |
   | `JWT_SECRET` | Cualquier texto largo |

   Si usás SQL Server Express: descomentar `DB_INSTANCE="SQLEXPRESS"` y, en `DATABASE_URL`, cambiar `localhost:1433` por `localhost\SQLEXPRESS`.

4. Generar el cliente de Prisma:
   ```
   npx prisma generate
   ```

5. Cargar los 10 productos de prueba:
   ```
   npm run seed
   ```

6. Levantar el servidor:
   ```
   npm run dev
   ```

7. Probar que funciona. Abrir en el navegador `http://localhost:3000/api/health`. Tiene que responder:
   ```
   { "status": "ok", "database": "conectada" }
   ```

## Problemas comunes
- **Error de TLS o certificado:** revisar que `DATABASE_URL` termine con `trustServerCertificate=true`.
- **`Login failed for user ''`:** faltan `DB_USER` y `DB_PASSWORD` en el `.env`.
- **No conecta:** revisar que TCP/IP esté activado en SQL Server Configuration Manager y que se reinició el servicio.
- **No encuentra `generated/prisma`:** correr `npx prisma generate`.