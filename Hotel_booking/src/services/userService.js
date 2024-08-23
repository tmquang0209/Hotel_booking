import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import ApiException from "../utils/apiException.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import ManageAccess from "../models/manageAccess.js";
import Users from "../models/users.js";
import { errorsCode } from "../enums/errorsCode.js";

class UserService {
    static async validateUser(username, password = null) {
        const user = await Users.query().findOne({ username });
        if (!user) {
            throw new ApiException(1001);
        }

        if (password && !(await comparePassword(password, user.password))) {
            throw new ApiException(1001);
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
        await ManageAccess.query().insert({
            username,
            refresh_token: refreshToken,
            access_token: accessToken,
        });
    }

    static async verifyAndRefreshToken(refreshToken) {
        const storedToken = await ManageAccess.query().findOne({ refresh_token: refreshToken });
        const payload = verifyRefreshToken(refreshToken);
        if (!storedToken && !payload) {
            throw new ApiException(1005, errorsCode.UNAUTHORIZED);
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
        if (!isValid) throw new ApiException(1005, errorsCode.UNAUTHORIZED);

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
            throw new ApiException(1018, errorsCode.BAD_REQUEST);
        }

        const encryptPassword = await hashPassword(newPassword);
        const change = await Users.query().patchAndFetchById(user.id, { password: encryptPassword }).where("id", user.id);

        return change;
    }
}

export default UserService;
