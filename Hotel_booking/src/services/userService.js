import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import ApiException from "../utils/apiException.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import ManageAccess from "../models/manageAccess.js";
import Users from "../models/users.js";

class UserService {
    static async validateUser(username, password = null) {
        const user = await Users.query().findOne({ username });
        if (!user) {
            throw new ApiException(1002, "User not found", null);
        }

        if (password && !(await comparePassword(password, user.password))) {
            throw new ApiException(1001, "Password is incorrect", null);
        }

        return user;
    }

    static async createUser(data) {
        const user = await Users.query().findOne({ username: data.username });
        if (user) {
            throw new ApiException(1003, "Username already exists", null);
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
        await ManageAccess.query().insert({
            username,
            refresh_token: refreshToken,
            access_token: accessToken,
        });
    }

    static async verifyAndRefreshToken(refreshToken) {
        const storedToken = await ManageAccess.query().findOne({ refresh_token: refreshToken });
        if (!storedToken) {
            throw new ApiException(1008, "Refresh token is invalid.");
        }

        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new ApiException(1008, "Invalid refresh token.");
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = payload.exp - currentTime;

        let newRefreshToken = refreshToken;

        if (timeLeft <= 60) {
            newRefreshToken = generateRefreshToken({
                id: payload.id,
                username: payload.username,
                type: payload.type,
            });

            await ManageAccess.query().update({ refresh_token: newRefreshToken }).where("refresh_token", refreshToken);
        }

        return { payload, newRefreshToken };
    }

    static async deleteToken(refreshToken) {
        const isValid = await ManageAccess.query().findOne({ refresh_token: refreshToken });
        if (!isValid) throw new ApiException(1009, "Refresh token is invalid.");

        await ManageAccess.query().delete().where("refresh_token", refreshToken);
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
            throw new ApiException(1003, "Old password is incorrect");
        }

        const encryptPassword = await hashPassword(newPassword);
        const change = await Users.query().patchAndFetchById(user.id, { password: encryptPassword }).where("id", user.id);

        return change;
    }
}

export default UserService;
