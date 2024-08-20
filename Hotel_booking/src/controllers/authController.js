import UserService from "../services/userService.js";
import ApiException from "../utils/apiException.js";
import { apiResponse } from "../utils/apiResponse.js";
import Exception from "../utils/exception.js";

async function loginController(req, res) {
    try {
        const { username, password } = req.body;

        const user = await UserService.validateUser(username, password);

        const { accessToken, refreshToken } = UserService.generateTokens(user);

        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

        await UserService.saveTokens(username, accessToken, refreshToken);

        return res.json(apiResponse(1002, "Login successfully", { accessToken, refreshToken }));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

async function signupController(req, res) {
    try {
        const { username, password, email, full_name, address, phone_number, type } = req.body;

        const user = await UserService.createUser({ username, password, email, full_name, address, phone_number, type });

        return res.json(apiResponse(1004, "Signup successfully", user));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

async function refreshTokenController(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new ApiException(1005, "Refresh token is required", null);
        }

        const { payload, newRefreshToken } = await UserService.verifyAndRefreshToken(refreshToken);

        const user = await UserService.validateUser(payload.username);

        const accessToken = UserService.generateTokens(user).accessToken;

        return res.json(apiResponse(1007, "Refresh token successfully", { accessToken, refreshToken: newRefreshToken }));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

async function logoutController(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        await UserService.deleteToken(refreshToken);

        res.cookie("refreshToken", null);

        return res.json(apiResponse(1010, "Logout successful"));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export { loginController, signupController, refreshTokenController, logoutController };
