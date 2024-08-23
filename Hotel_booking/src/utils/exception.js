import { apiResponse } from "./apiResponse.js";
import Logs from "../models/logs.js";
class Exception {
    constructor(code, data, httpCode) {
        this.code = code;
        this.data = data;
        this.httpCode = httpCode;
    }

    static async handle(error, request, response) {
        this.code = error.code || 500;
        this.message = error.message || "Internal Server Error";
        this.data = error.data || error.stack || {};
        this.httpCode = error.httpCode || 500;

        const user = request?.user;
        let bodyData = this.data || request.body;

        bodyData = typeof bodyData === "object" ? JSON.stringify(bodyData) : bodyData;

        const logData = {
            username: user?.username,
            http_code: this.httpCode.toString(),
            method: request.method,
            path: request.path,
            data: bodyData,
            description: this.message,
        };

        await Logs.query().insert(logData);

        return response.status(this.httpCode).json(apiResponse(this.code, false, this.data));
    }
}

export default Exception;
