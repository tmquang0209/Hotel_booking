import { loginController, logoutController, refreshTokenController, signupController } from "../src/controllers/authController";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";
import UserService from "../src/services/userService";
import ApiException from "../src/utils/apiException";

jest.mock("../src/services/userService");

describe("Auth Controller", () => {
    let req, res, user, tokens;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        user = {
            id: 1,
            username: "john_doe",
            password: "password123",
            type: "owner",
        };
        tokens = {
            accessToken: "access_token",
            refreshToken: "refresh_token",
        };

        // Mock common methods
        UserService.generateTokens.mockReturnValue(tokens);
        UserService.saveTokens.mockResolvedValue();
    });

    describe("Login controller", () => {
        it("Should login successfully and return access token and refresh token", async () => {
            req.body = { username: "john_doe", password: "password123" };
            UserService.validateUser.mockResolvedValue(user);

            await loginController(req, res);

            expect(UserService.validateUser).toHaveBeenCalledWith("john_doe", "password123");
            expect(UserService.generateTokens).toHaveBeenCalledWith(user);
            expect(UserService.saveTokens).toHaveBeenCalledWith("john_doe", tokens.accessToken, tokens.refreshToken);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ success: true, message: "Login successfully", data: tokens });
            expect(res.cookies.refreshToken.value).toBe(tokens.refreshToken);
        });

        it("Should return error when username does not exist", async () => {
            req.body = { username: "non_existing_user", password: "password123" };
            UserService.validateUser.mockRejectedValueOnce(new ApiException(1001));

            await loginController(req, res);

            expect(UserService.validateUser).toHaveBeenCalledWith("non_existing_user", "password123");
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({
                success: false,
                message: "Username or password is incorrect",
                data: {},
            });
        });

        it("Should return error when password is incorrect", async () => {
            req.body = { username: "john_doe", password: "wrong_password" };
            UserService.validateUser.mockRejectedValueOnce(new ApiException(1001));

            await loginController(req, res);

            expect(UserService.validateUser).toHaveBeenCalledWith("john_doe", "wrong_password");
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({
                success: false,
                message: "Username or password is incorrect",
                data: {},
            });
        });
    });

    describe("Signup controller", () => {
        it("Should signup successfully and return user data", async () => {
            req.body = {
                username: "john_doe",
                password: "password123",
                email: "john_doe@gmail.com",
                fullName: "John Doe",
                address: "123 Main St",
                phoneNumber: "1234567890",
                type: "owner",
            };
            const user = {
                id: 1,
                username: "john_doe",
                password: "password123",
                email: "john_doe@gmail.com",
                fullName: "John Doe",
                address: "123 Main St",
                phoneNumber: "1234567890",
                type: "owner",
            };
            UserService.createUser.mockResolvedValue(user);

            await signupController(req, res);

            expect(UserService.createUser).toHaveBeenCalledWith({
                username: "john_doe",
                password: "password123",
                email: "john_doe@gmail.com",
                full_name: "John Doe",
                address: "123 Main St",
                phone_number: "1234567890",
                type: "owner",
            });
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ success: true, message: "Signup successfully", data: user });
        });

        it("Should return error when username is already taken", async () => {
            req.body = {
                username: "john_doe",
                password: "password123",
                email: "john_doe@gmail.com",
                fullName: "John Doe",
                address: "123 Main St",
                phoneNumber: "1234567890",
                type: "owner",
            };
            UserService.createUser.mockRejectedValueOnce(new ApiException(1014));

            await signupController(req, res);

            expect(UserService.createUser).toHaveBeenCalledWith({
                username: "john_doe",
                password: "password123",
                email: "john_doe@gmail.com",
                full_name: "John Doe",
                address: "123 Main St",
                phone_number: "1234567890",
                type: "owner",
            });
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ success: false, message: "User already exists", data: {} });
        });
    });

    describe("Refresh token controller", () => {
        it("Should refresh token successfully and return new access token and refresh token", async () => {
            req.cookies = { refreshToken: "old_refresh_token" };
            req.headers = { authorization: "Bearer old_access_token" };
            const payload = {
                id: 1,
                username: "john_doe",
                password: "password123",
                type: "owner",
            };
            const newTokens = {
                accessToken: "new_access_token",
                refreshToken: "new_refresh_token",
            };
            UserService.verifyAndRefreshToken.mockResolvedValue({ payload, newRefreshToken: newTokens.refreshToken });
            UserService.validateUser.mockResolvedValue(user);
            UserService.generateTokens.mockReturnValue(newTokens);

            await refreshTokenController(req, res);

            expect(UserService.verifyAndRefreshToken).toHaveBeenCalledWith("old_refresh_token");
            expect(UserService.validateUser).toHaveBeenCalledWith("john_doe");
            expect(UserService.generateTokens).toHaveBeenCalledWith(user);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ success: true, message: "Refresh token successfully", data: newTokens });
        });

        it("Should return error when refresh token is invalid", async () => {
            req.cookies = { refreshToken: "invalid_refresh_token" };
            req.headers = { authorization: "Bearer old_access_token" };
            UserService.verifyAndRefreshToken.mockRejectedValueOnce(new ApiException(1005));

            await refreshTokenController(req, res);

            expect(UserService.verifyAndRefreshToken).toHaveBeenCalledWith("invalid_refresh_token");
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ success: false, message: "Refresh token is invalid", data: {} });
        });

        it("Should return error when refresh token is empty", async () => {
            req.cookies = {};
            req.headers = { authorization: "Bearer old_access_token" };

            await refreshTokenController(req, res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ success: false, message: "Refresh token is required", data: {} });
            expect(UserService.verifyAndRefreshToken).not.toHaveBeenCalled();
        });
    });

    describe("Logout controller", () => {
        it("Should logout successfully and delete refresh token", async () => {
            req.cookies = { refreshToken: "old_refresh_token" };

            await logoutController(req, res);

            expect(UserService.deleteToken).toHaveBeenCalledWith("old_refresh_token");
            expect(res.cookies.refreshToken.value).toBe(null);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ success: true, message: "Logout successfully" });
        });

        it("Should return error when refresh token is empty", async () => {
            req.cookies = {
                refreshToken: "wrong_refresh_token",
            };

            UserService.deleteToken.mockRejectedValueOnce(new ApiException(1005, 401));

            await logoutController(req, res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ success: false, message: "Refresh token is invalid", data: {} });
        });
    });
});
