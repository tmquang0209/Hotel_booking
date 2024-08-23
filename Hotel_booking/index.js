import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "./src/config/database.js";
import authentication from "./src/middlewares/authentication.js";
import authorize from "./src/middlewares/authorization.js";
import authRouter from "./src/routes/authRouter.js";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/userRouter.js";
import hotelRouter from "./src/routes/hotelRouter.js";
import roomRouter from "./src/routes/roomRouter.js";
import { notFoundPage } from "./src/utils/logs.js";
import bookingRouter from "./src/routes/bookingRouter.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(authentication);

app.use("/auth", authRouter);

app.use("/user", userRouter);

app.use("/hotel", authorize(["OWNER"]), hotelRouter);

app.use("/room", authorize(["OWNER"]), roomRouter);

app.use("/booking", bookingRouter);

app.use(notFoundPage);

app.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});

export default app;
