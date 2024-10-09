import express from "express";
import { firebase } from "./firebase";
import bookRouter from "./routes/book.route";

firebase;

const PORT = 3000;
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.use("/book", bookRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
