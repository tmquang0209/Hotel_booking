import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { setup, serve } from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { schedule } from "node-cron";
import xlsx from "xlsx";

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
import Logs from "./src/models/logs.js";

const PORT = process.env.PORT || 3000;
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API Documentation",
        version: "1.0.0",
        description: "OpenAPI documentation for the booking hotel project. This API is used to manage users, hotels, rooms, and bookings.",
    },
    servers: [
        {
            url: "http://localhost:3000",
        },
    ],
};

// // Options for the swagger docs
// const options = {
//     swaggerDefinition,
//     apis:
// };

const __dirname = path.resolve();
const apiDir = path.join(__dirname, "/src/API");
const files = fs.readdirSync(apiDir);
let apis = [];
files.forEach((file) => {
    apis.push(path.join(apiDir, file));
});

const options = {
    swaggerDefinition,
    apis,
};
const swaggerSpec = swaggerJSDoc(options);

schedule("* * * * *", async () => {
    console.log("This is a scheduled task");

    // Get all logs from the database
    const logs = await Logs.query().select();

    // Convert logs to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(logs);

    // Create a new workbook and add the worksheet to it
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Logs");

    // Save the workbook to an Excel file
    xlsx.writeFile(workbook, "logs.xlsx");
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api-docs", serve, setup(swaggerSpec));

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
