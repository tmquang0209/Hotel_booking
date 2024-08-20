import Guests from "../models/guests.js";
import Owners from "../models/owners.js";
import ApiException from "../utils/apiException.js";
import Exception from "../utils/exception.js";
import UserService from "../services/userService.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { apiResponse } from "../utils/apiResponse.js";

export async function getUserInfo(req, res) {
    const user = req.user;
    try {
        const userInfo = await UserService.getUserDetails(user);

        return res.json(apiResponse(1002, "Get user info successfully", userInfo));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function updateUserInfo(req, res) {
    const user = req.user;
    const { full_name, email, address, birthday, phone_number } = req.body;
    try {
        const userInfo = await UserService.updateUserInfo(user, {
            full_name,
            email,
            address,
            birthday,
            phone_number,
        });

        return res.json(apiResponse(1002, "Update user info successfully", userInfo));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function changePassword(req, res) {
    const user = req.user;
    const { old_password, new_password, confirm_password } = req.body;
    try {
        const userDetails = await UserService.getUserDetails(user);

        await UserService.changePassword(userDetails, { old_password, new_password });

        return res.json(apiResponse(1002, "Change password successfully"));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}
