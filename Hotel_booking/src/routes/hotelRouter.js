import express from "express";
import { createHotel, deleteHotel, getAllHotelByUser, getDetails, updateHotelInfo } from "../controllers/hotelController.js";
import { createNewHotel } from "../middlewares/validate.js";
import validateError from "../middlewares/validateError.js";

const hotelRouter = express.Router();

hotelRouter.post("/create", createNewHotel, validateError, createHotel);

hotelRouter.get("/details", getDetails);

hotelRouter.get("/all", getAllHotelByUser);

hotelRouter.put("/update", createNewHotel, validateError, updateHotelInfo);

hotelRouter.delete("/delete", deleteHotel);

export default hotelRouter;
