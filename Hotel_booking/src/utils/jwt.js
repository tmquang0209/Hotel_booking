import jwt from "jsonwebtoken";
import "dotenv/config";
import ApiException from "./apiException";
import { errorsCode } from "../enums/errorsCode";

const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const generateRefreshToken = (data) => {
    return jwt.sign(data, process.env.JWT_REFRESH, { expiresIn: "7d" });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        if (e.data?.expiredAt) throw new ApiException(1011, errorsCode.FORBIDDEN);
        else throw new ApiException(1010, errorsCode.FORBIDDEN);
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH);
    } catch (e) {
        if (e.data?.expiredAt) throw new ApiException(1006, errorsCode.UNAUTHORIZED);
        else throw new ApiException(1008, errorsCode.UNAUTHORIZED);
    }
};

export { generateAccessToken, generateRefreshToken, verifyToken, verifyRefreshToken };
