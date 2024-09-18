import { errorsCode } from "../enums/errorsCode.js";
import UserService from "../services/userService.js";
import ApiException from "../utils/apiException.js";
import { apiResponse } from "../utils/apiResponse.js";
import Exception from "../utils/exception.js";

async function loginController(req, res) {
    try {
        const { username, password } = req.body;

        const user = await UserService.validateUser(username, password);

        const { accessToken, refreshToken } = UserService.generateTokens(user);

        // Set the refresh token in the cookie
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

        // Save the refresh token in the redis (username, refreshToken, accessToken pair)

        await UserService.saveTokens(username, accessToken, refreshToken);

        return res.json(apiResponse(1002, true, { accessToken, refreshToken }));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

async function signupController(req, res) {
    try {
        const { username, password, email, fullName, address, phoneNumber, type } = req.body;

        const data = {
            username,
            password,
            email,
            full_name: fullName,
            address,
            phone_number: phoneNumber,
            type,
        };

        const user = await UserService.createUser(data);

        return res.json(apiResponse(1015, true, user));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

async function refreshTokenController(req, res) {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.headers.authorization;

    if (!refreshToken) {
        throw new ApiException(1004, errorsCode.UNAUTHORIZED);
    }
    try {
        const { payload, newRefreshToken } = await UserService.verifyAndRefreshToken(refreshToken, accessToken);

        const user = await UserService.validateUser(payload.username);

        const newAccessToken = UserService.generateTokens(user).accessToken;

        await UserService.saveTokens(payload.username, newAccessToken, refreshToken);

        return res.json(apiResponse(1007, true, { accessToken: newAccessToken, refreshToken: newRefreshToken }));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

async function logoutController(req, res) {
    const username = req.user.username;
    try {
        const refreshToken = req.cookies.refreshToken;

        await UserService.deleteToken(username,refreshToken);

        res.cookie("refreshToken", null);

        return res.json(apiResponse(1013, true));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export { loginController, logoutController, refreshTokenController, signupController };
