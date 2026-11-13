import { Router } from "express";
import { LoginController } from "../controller/login.controller";

const loginRouter = Router();
const loginController = new LoginController();

loginRouter.post("/register", loginController.registrar);
loginRouter.post("/login", loginController.login);

export default loginRouter;