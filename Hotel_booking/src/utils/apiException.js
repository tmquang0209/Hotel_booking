"use strict";
import Exception from "./exception.js";

class ApiException extends Exception {
    constructor(code = -1, message = "", data = null) {
        super(code, message, data, 400);
    }
}

export default ApiException;
