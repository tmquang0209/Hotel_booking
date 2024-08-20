import { validationResult } from "express-validator";
import ApiException from "../utils/apiException.js";
import Exception from "../utils/exception.js";

var validateError = (req, res, next) => {
    var errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            throw new ApiException(400, "Validation Error", errors.array());
        }
        next();
    } catch (error) {
        Exception.handle(error, req, res);
    }
};

export default validateError;
