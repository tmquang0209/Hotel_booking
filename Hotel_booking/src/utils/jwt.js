import jwt from "jsonwebtoken";
import "dotenv/config";

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
        if (e.data?.expiredAt) throw new Error("Token expired");
        else throw new Error("Invalid token");
    }
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH);
};

export { generateAccessToken, generateRefreshToken, verifyToken, verifyRefreshToken };
