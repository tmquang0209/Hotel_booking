import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import ApiException from "../utils/apiException.js";
import Owners from "../models/owners.js";
import Guests from "../models/guests.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import ManageAccess from "../models/manageAccess.js";

class UserService {
    static async validateUser(username, password = null) {
        const [ownerData, guestData] = await Promise.all([Owners.query().findOne({ username }), Guests.query().findOne({ username })]);

        if (!ownerData && !guestData) {
            throw new ApiException(1001, "Username is incorrect", null);
        }

        const user = ownerData ? { ...ownerData, type: "OWNER" } : { ...guestData, type: "GUEST" };
        if (password)
            if (!(await comparePassword(password, user.password))) {
                throw new ApiException(1001, "Password is incorrect", null);
            }

        return user;
    }

    static async createUser({ username, password, email, full_name, address, phone_number, type }) {
        const encryptPassword = await hashPassword(password);
        const [ownerData, guestData] = await Promise.all([Owners.query().findOne({ username }), Guests.query().findOne({ username })]);

        if (ownerData || guestData) {
            throw new ApiException(1003, "Username already exists", null);
        }

        if (type === "OWNER") {
            return Owners.query().insert({
                username,
                password: encryptPassword,
                email,
                full_name,
                address,
                phone_number,
            });
        } else {
            return Guests.query().insert({
                username,
                password: encryptPassword,
                email,
                full_name,
                address,
                phone_number,
            });
        }
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
        if (user.type === "OWNER") {
            var userInfo = await Owners.query().findOne({
                id: user.id,
                username: user.username,
            });
            var type = "OWNER";
        } else if (user.type === "GUEST") {
            var userInfo = await Guests.query().findOne({
                id: user.id,
                username: user.username,
            });
            var type = "GUEST";
        }

        return { ...userInfo, type: type };
    }

    static async updateUserInfo(user, { full_name, email, address, birthday, phone_number }) {
        if (user.type === "OWNER") {
            var userInfo = await Owners.query().patchAndFetchById(user.id, {
                full_name: full_name,
                address: address,
                email: email,
                phone_number: phone_number,
                birthday: birthday,
            });
            var type = "OWNER";
        } else if (user.type === "GUEST") {
            var userInfo = await Guests.query().patchAndFetchById(user.id, {
                full_name: full_name,
                address: address,
                email: email,
                phone_number: phone_number,
                birthday: birthday,
            });
            var type = "GUEST";
        }

        return { ...userInfo, type: type };
    }

    static async changePassword(user, { old_password, new_password }) {
        if (!(await comparePassword(old_password, user.password))) {
            throw new ApiException(1003, "Old password is incorrect");
        }

        const encryptPassword = await hashPassword(new_password);
        if (user.type === "OWNER") {
            await Owners.query().patchAndFetchById(user.id, {
                password: encryptPassword,
            });
        } else if (user.type === "GUEST") {
            await Guests.query().patchAndFetchById(user.id, {
                password: encryptPassword,
            });
        }
    }
}

export default UserService;
