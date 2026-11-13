import type { Request, Response } from "express";
import { UsuarioRepository } from "../repository/login.repository";
import { LoginService } from "../services/login.service";

const loginService = new LoginService(new UsuarioRepository());

export class LoginController {
  public registrar = async (req: Request, res: Response) => {
    try {
      const usuario = await loginService.registrar(req.body);
      res.status(201).json(usuario);
    } catch (error: any) {
      if (error.message === "DatosInvalidos") {
        return res.status(400).json({ message: "Completá todos los campos (clave de al menos 6 caracteres)." });
      }
      if (error.message === "EmailExistente") {
        return res.status(409).json({ message: "Ese email ya está registrado." });
      }
      res.status(500).json({ message: "Error al registrar el usuario" });
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const usuario = await loginService.login(email, password);
      res.status(200).json(usuario);
    } catch (error: any) {
      if (error.message === "CredencialesInvalidas") {
        return res.status(401).json({ message: "Email o contraseña incorrectos." });
      }
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  };
}