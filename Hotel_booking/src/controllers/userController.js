import Exception from "../utils/exception.js";
import UserService from "../services/userService.js";
import { apiResponse } from "../utils/apiResponse.js";

export async function getUserInfo(req, res) {
    const user = req.user;
    try {
        const userInfo = await UserService.getUserDetails(user);

        return res.json(apiResponse(1017, true, userInfo));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function updateUserInfo(req, res) {
    const user = req.user;
    const { fullName, email, address, birthday, phoneNumber } = req.body;
    try {
        const data = {
            full_name: fullName,
            email,
            address,
            birthday,
            phone_number: phoneNumber,
        };

        const userInfo = await UserService.updateUserInfo(user, data);

        return res.json(apiResponse(1016, true, userInfo));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function changePassword(req, res) {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;
    try {
        const userDetails = await UserService.getUserDetails(user);

        const data = {
            oldPassword,
            newPassword,
        };

        await UserService.changePassword(userDetails, data);

        return res.json(apiResponse(1020, true));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}
