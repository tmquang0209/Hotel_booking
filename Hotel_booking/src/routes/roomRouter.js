import express from "express";
import { createRoom, deleteRoom, getByHouse, getDetails, updateDetails } from "../controllers/roomController.js";
import { roomValidation } from "../middlewares/validate.js";
import validateError from "../middlewares/validateError.js";

const roomRouter = express.Router();

roomRouter.post("/create", roomValidation, validateError, createRoom);

roomRouter.get("/details", getDetails);

roomRouter.get("/list-by-house", getByHouse);

roomRouter.put("/update", roomValidation, validateError, updateDetails);

roomRouter.delete("/delete", deleteRoom);

export default roomRouter;
