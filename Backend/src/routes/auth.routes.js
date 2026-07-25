import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { registerValidation } from "../validators/auth.validator.js";
import { verifyEmail, login, getMe } from "../controllers/auth.controller.js";
import { loginValidation } from "../validators/auth.validator.js";
import { authUser } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerValidation, register);

authRouter.post("/login", loginValidation, login);

authRouter.get("/get-me", authUser, getMe);

authRouter.get("/verify-email", verifyEmail);

export default authRouter;