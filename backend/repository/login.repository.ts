import { prisma } from "../config/db";

export class UsuarioRepository {
  async buscarPorEmail(email: string) {
    return await prisma.users.findUnique({ where: { email } });
  }

  async crearUsuario(data: {
    email: string;
    password_hash: string;
    nombre: string;
    apellido: string;
    direccion: string;
  }) {
    return await prisma.users.create({ data });
  }
}