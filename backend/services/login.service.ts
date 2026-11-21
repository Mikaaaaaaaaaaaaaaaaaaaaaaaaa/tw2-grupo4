import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { UsuarioRepository } from "../repository/login.repository";
import type { Usuario } from "../models/usuario.model";
import type { Rol } from "../models/rol.model";
import jwt from "jsonwebtoken";
import { enviarMail } from "./mail.service";
import { cumplePoliticaPassword } from "./password-policy";

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

interface DatosSesion {
  id: number;
  nombre: string;
  email: string;
  role: string;
}

function crearToken(usuario: { id: number; email: string; role: Rol }): string {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );
}

function armarSesion(usuario: DatosSesion) {
  const role = usuario.role as Rol;
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    role,
    token: crearToken({ id: usuario.id, email: usuario.email, role }),
  };
}

export class LoginService {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async registrar(datos: Usuario) {
    const { email, password, nombre, apellido, direccion } = datos;

    if (
      !email ||
      !password ||
      !nombre ||
      !apellido ||
      !direccion ||
      typeof password !== "string"
    ) {
      throw new Error("DatosInvalidos");
    }

    if (!cumplePoliticaPassword(password)) {
      throw new Error("PasswordInvalida");
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

    return armarSesion(usuario);
  }

  async solicitarRecuperacion(email: string) {
    const usuario = email
      ? await this.usuarioRepository.buscarPorEmail(email)
      : null;
    if (!usuario) return;

    const token = jwt.sign(
      { id: usuario.id },
      `${process.env.JWT_SECRET}${usuario.password_hash}`,
      { expiresIn: "15m" },
    );

    const frontend = process.env.FRONTEND_URL ?? "http://localhost:4200";
    const link = `${frontend}/restablecer?token=${token}`;

    await enviarMail(
      usuario.email,
      "Recuperar contraseña",
      `<p>Hacé clic para elegir una clave nueva (el enlace vence en 15 minutos):</p><a href="${link}">${link}</a>`,
    );
  }

  async restablecer(token: string, nuevaPassword: string) {
    if (!token || !nuevaPassword || nuevaPassword.length < 6) {
      throw new Error("DatosInvalidos");
    }

    const datos = jwt.decode(token) as { id?: number } | null;
    if (!datos?.id) throw new Error("TokenInvalido");

    const usuario = await this.usuarioRepository.buscarPorId(datos.id);
    if (!usuario) throw new Error("TokenInvalido");

    try {
      jwt.verify(token, `${process.env.JWT_SECRET}${usuario.password_hash}`);
    } catch {
      throw new Error("TokenInvalido");
    }

    await this.usuarioRepository.actualizarPassword(
      usuario.id,
      hashear(nuevaPassword),
    );
  }

  async login(email: string, password: string) {
    const usuario = email
      ? await this.usuarioRepository.buscarPorEmail(email)
      : null;

    if (!usuario || !password || !coincide(password, usuario.password_hash)) {
      throw new Error("CredencialesInvalidas");
    }

    return armarSesion(usuario);
  }
}
