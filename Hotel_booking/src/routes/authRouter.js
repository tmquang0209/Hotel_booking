import express from "express";
import { loginValidation, signupValidation } from "../middlewares/validate.js";
import validateError from "../middlewares/validateError.js";
import { loginController, logoutController, refreshTokenController, signupController } from "../controllers/authController.js";

var authRouter = express.Router();

authRouter.post("/login", loginValidation, validateError, loginController);

authRouter.post("/signup", signupValidation, validateError, signupController);

authRouter.post("/refresh-token", refreshTokenController);

authRouter.post("/logout", logoutController);

export default authRouter;
