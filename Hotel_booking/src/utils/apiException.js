"use strict";
import Exception from "./exception.js";

class ApiException extends Exception {
    constructor(code = -1, httpCode = 400, data = null) {
        super(code, data, httpCode);
    }
}

export default ApiException;
