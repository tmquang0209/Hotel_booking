import express from "express";
import { changePassword as changePasswordController, getUserInfo, updateUserInfo } from "../controllers/userController.js";
import { changePassword, updateInfo } from "../middlewares/validate.js";
import validateError from "../middlewares/validateError.js";

const userRouter = express.Router();

userRouter.get("/info", getUserInfo);
userRouter.put("/update", updateInfo, validateError, updateUserInfo);
userRouter.put("/change-password", changePassword, validateError, changePasswordController);

export default userRouter;
