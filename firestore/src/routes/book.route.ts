import express from "express";
import { createBook } from "../controllers/book.controller";

const bookRouter = express.Router();

bookRouter.post("/add", createBook);

export default bookRouter;
