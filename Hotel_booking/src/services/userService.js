import redisClient from "../config/redis.js";
import { errorsCode } from "../enums/errorsCode.js";
import Users from "../models/users.js";
import ApiException from "../utils/apiException.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

class UserService {
    static async validateUser(username, password = null) {
        const user = await Users.query().findOne({ username });
        if (!user) {
            throw new ApiException(1001); // Username doesn't exist
        } else if (password && !(await comparePassword(password, user.password))) {
            throw new ApiException(1001); // Password mismatch
        }

        return user;
    }

    static async createUser(data) {
        const user = await Users.query().findOne({ username: data.username });
        if (user) {
            throw new ApiException(1014);
        }

        const encryptPassword = await hashPassword(data.password);

        const newUser = await Users.query().insert({ ...data, password: encryptPassword });

        return newUser;
    }

    static generateTokens(user) {
        const accessToken = generateAccessToken({
            id: user.id,
            username: user.username,
            password: user.password,
            type: user.type,
        });

        const refreshToken = generateRefreshToken({
            id: user.id,
            username: user.username,
            type: user.type,
        });

        return { accessToken, refreshToken };
    }

    static async saveTokens(username, accessToken, refreshToken) {
        // delete old token
        await redisClient.hDel(username, refreshToken);
        await redisClient.hSet(username, refreshToken, accessToken);
    }

    static async verifyAndRefreshToken(refreshToken, accessToken) {
        // const storedToken = await ManageAccess.query().findOne({ refresh_token: refreshToken });
        const payload = verifyRefreshToken(refreshToken);
        const storedToken = await redisClient.hGetAll(payload.username);

        if (!storedToken[refreshToken] || storedToken[refreshToken].trim() !== accessToken.replace("Bearer ", "").trim()) {
            throw new ApiException(1005, errorsCode.UNAUTHORIZED);
        }

        return { payload, refreshToken };
    }

    static async deleteToken(username, refreshToken) {
        await redisClient.hDel(username, refreshToken);
        // const isValid = await ManageAccess.query().findOne({ refresh_token: refreshToken });
        // if (!isValid) throw new ApiException(1005, errorsCode.UNAUTHORIZED);
        // await ManageAccess.query().delete().where("refresh_token", refreshToken);
    }

    static async getUserDetails(user) {
        const userInfo = await Users.query().findById(user.id);
        return userInfo;
    }

    static async updateUserInfo(user, data) {
        const userInfo = await Users.query().patchAndFetchById(user.id, data);

        return userInfo;
    }

    static async changePassword(user, { oldPassword, newPassword }) {
        if (!(await comparePassword(oldPassword, user.password))) {
            throw new ApiException(1018, errorsCode.BAD_REQUEST);
        }

        const encryptPassword = await hashPassword(newPassword);
        const change = await Users.query().patchAndFetchById(user.id, { password: encryptPassword });

        return change;
    }
}

export default UserService;
