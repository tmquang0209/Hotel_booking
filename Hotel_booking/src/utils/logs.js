import { errorsCode } from "../enums/errorsCode.js";
import Logs from "../models/logs.js";

export const notFoundPage = async (req, res) => {
    const user = req?.user;

    const data = {
        username: user?.username,
        method: req.method,
        http_code: "404",
        path: req.path,
        data: req.body ? JSON.stringify(req.body) : null,
        description: "Page not found",
    };

    await Logs.query().insert(data);

    return res.status(errorsCode.NOT_FOUND).send("Page not found");
};
