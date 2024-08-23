import ApiException from "../utils/apiException.js";
import Exception from "../utils/exception.js";
import { errorsCode } from "../enums/errorsCode.js";

const authorize = (roles = []) => {
    return (req, res, next) => {
        try {
            if (!roles.includes(req.user.type)) {
                throw new ApiException(998, errorsCode.UNAUTHORIZED);
            }
            next();
        } catch (error) {
            Exception.handle(error, req, res);
        }
    };
};

export default authorize;
