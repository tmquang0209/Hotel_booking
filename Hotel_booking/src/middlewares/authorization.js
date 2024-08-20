import ApiException from "../utils/apiException.js";
import Exception from "../utils/exception.js";

const authorize = (roles = []) => {
    return (req, res, next) => {
        try {
            if (!roles.includes(req.user.type)) {
                throw new ApiException(403, "You are not authorized to access this resource");
            }
            next();
        } catch (error) {
            Exception.handle(error, req, res);
        }
    };
};

export default authorize;
