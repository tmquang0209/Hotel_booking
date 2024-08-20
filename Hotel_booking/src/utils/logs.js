import Logs from "../models/logs.js";

export const saveLog = async (req, res, next) => {
    const user = req?.user;

    const data = {
        username: user?.username,
        method: req.method,
        http_code: "404",
        path: req.path,
        data: req.body ? JSON.stringify(req.body) : null,
        description: res.statusMessage,
    };

    await Logs.query().insert(data);

    return res.status(404).send("Page not found");
};
