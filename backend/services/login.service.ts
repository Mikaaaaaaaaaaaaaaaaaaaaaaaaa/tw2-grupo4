import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { UsuarioRepository } from "../repository/login.repository";
import type { Usuario } from "../models/usuario.model";

function hashear(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function coincide(password: string, guardado: string): boolean {
  const [salt, hash] = guardado.split(":");
  if (!salt || !hash) return false;

  const nuevo = scryptSync(password, salt, 64);
  const hashGuardado = Buffer.from(hash, "hex");
  return nuevo.length === hashGuardado.length && timingSafeEqual(nuevo, hashGuardado);
}

export class LoginService {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async registrar(datos: Usuario) {
    const { email, password, nombre, apellido, direccion } = datos;

    if (!email || !password || !nombre || !apellido || !direccion || password.length < 6) {
      throw new Error("DatosInvalidos");
    }

    const existe = await this.usuarioRepository.buscarPorEmail(email);
    if (existe) {
      throw new Error("EmailExistente");
    }

    const usuario = await this.usuarioRepository.crearUsuario({
      email,
      password_hash: hashear(password),
      nombre,
      apellido,
      direccion,
    });

    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  }

  async login(email: string, password: string) {
    const usuario = email ? await this.usuarioRepository.buscarPorEmail(email) : null;

    if (!usuario || !password || !coincide(password, usuario.password_hash)) {
      throw new Error("CredencialesInvalidas");
    }

    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  }
}