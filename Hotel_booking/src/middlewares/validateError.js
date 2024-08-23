import { validationResult } from "express-validator";
import ApiException from "../utils/apiException.js";
import Exception from "../utils/exception.js";
import { errorsCode } from "../enums/errorsCode.js";

var validateError = (req, res, next) => {
    var errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            throw new ApiException(999, errorsCode.BAD_REQUEST, errors.array());
        }
        next();
    } catch (error) {
        Exception.handle(error, req, res);
    }
};

export default validateError;
