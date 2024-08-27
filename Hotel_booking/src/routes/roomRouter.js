import express from "express";
import { createRoom, deleteRoom, getByHouse, getDetails, updateDetails } from "../controllers/roomController.js";
import { roomValidation } from "../middlewares/validate.js";
import validateError from "../middlewares/validateError.js";
import authorize from "../middlewares/authorization.js";

const roomRouter = express.Router();

roomRouter.post("/create", authorize(["OWNER"]), roomValidation, validateError, createRoom);

roomRouter.get("/details", getDetails);

roomRouter.get("/list-by-hotel", getByHouse);

roomRouter.put("/update", authorize(["OWNER"]), roomValidation, validateError, updateDetails);

roomRouter.delete("/delete", authorize(["OWNER"]), deleteRoom);

export default roomRouter;
