import httpMocks from "node-mocks-http";
import UserService from "../src/services/userService";
import { changePassword, getUserInfo, updateUserInfo } from "../src/controllers/userController";
import { expect, jest, describe, it, beforeEach } from "@jest/globals";

jest.mock("../src/services/userService");

describe("User Controller", () => {
    let req, res, user;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();

        user = {
            id: 1,
            username: "test",
            password: "test",
            type: "owner",
        };

        req.user = user;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getUserInfo", () => {
        it("should return user info", async () => {
            const userInfo = {
                id: 1,
                username: "test",
                email: "test@gmail.com",
                address: "test address",
                phoneNumber: "123456789",
                birthday: "2000-01-01",
                status: 1,
                type: "owner",
                createdAt: "2021-10-01T00:00:00.000Z",
            };

            await UserService.getUserDetails.mockResolvedValue(userInfo);

            // Call the controller
            await getUserInfo(req, res);

            expect(UserService.getUserDetails).toHaveBeenCalledWith(req.user);

            expect(res.statusCode).toBe(200);

            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Get user info successfully",
                data: userInfo,
            });
        });
    });

    describe("updateUserInfo", () => {
        it("should update user info", async () => {
            const userInfo = {
                fullName: "Nguyen Van A",
                email: "nguyen_van_a@gmail.com",
                address: "test address",
                birthday: "2000-01-01",
                phoneNumber: "123456789",
            };

            await UserService.updateUserInfo.mockResolvedValue({
                id: 1,
                username: "test",
                full_name: "Nguyen Van A",
                email: "nguyen_van_a@gmail.com",
                address: "test address",
                phone_number: "123456789",
                birthday: "2000-01-01",
                status: 1,
                type: "owner",
                createdAt: "2021-10-01T00:00:00.000Z",
            });

            req.body = userInfo;

            await updateUserInfo(req, res);

            expect(UserService.updateUserInfo).toHaveBeenCalledWith(req.user, {
                full_name: "Nguyen Van A",
                email: "nguyen_van_a@gmail.com",
                address: "test address",
                birthday: "2000-01-01",
                phone_number: "123456789",
            });

            expect(res.statusCode).toBe(200);

            expect(res._getJSONData()).toEqual({
                success: true,
                message: "User updated successfully",
                data: {
                    id: 1,
                    username: "test",
                    full_name: "Nguyen Van A",
                    email: "nguyen_van_a@gmail.com",
                    address: "test address",
                    birthday: "2000-01-01",
                    phone_number: "123456789",
                    status: 1,
                    type: "owner",
                    createdAt: "2021-10-01T00:00:00.000Z",
                },
            });
        });
    });

    describe("Change password", () => {
        it("return change password successfully", async () => {
            const userDetails = {
                id: 1,
                username: "test",
                email: "test@gmail.com",
                address: "test address",
                birthday: "2000-01-01",
                phoneNumber: "123456789",
                status: 1,
                type: "owner",
                createdAt: "2021-10-01T00:00:00.000Z",
            };

            req.body = {
                oldPassword: "oldPassword",
                newPassword: "newPassword",
            };

            await UserService.changePassword.mockResolvedValue({
                id: 1,
                username: "test",
                password: "hashedPassword",
                type: "owner",
            });

            await changePassword(req, res);

            expect(UserService.changePassword).toHaveBeenCalledWith(userDetails, req.body);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Change password successfully",
            });
        });

        it("return old password is incorrect", async () => {
            const userDetails = {
                id: 1,
                username: "test",
                email: "test@gmail.com",
                address: "test address",
                birthday: "2000-01-01",
                phoneNumber: "123456789",
                status: 1,
                type: "owner",
                createdAt: "2021-10-01T00:00:00.000Z",
            };

            req.body = {
                oldPassword: "oldPassword",
                newPassword: "newPassword",
            };

            await UserService.changePassword.mockRejectedValue({
                code: 1018,
                httpCode: 400,
            });

            await changePassword(req, res);

            expect(UserService.changePassword).toHaveBeenCalledWith(userDetails, req.body);

            expect(res.statusCode).toBe(400);

            expect(res._getJSONData()).toEqual({
                success: false,
                message: "Old password is incorrect",
                data: {},
            });
        });
    });
});
