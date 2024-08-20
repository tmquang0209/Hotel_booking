import request from "supertest";
import app from "../index.js";

let accessTokenOfOwner = "";
let refreshTokenOfOwner = "";
let accessTokenOfGuest = "";
let refreshTokenOfGuest = "";

describe("POST /login", () => {
    it("Should return data of owner", async () => {
        // login
        const response = await request(app).post("/auth/login").send({
            username: "tmquang",
            password: "123456",
        });

        accessTokenOfOwner = response.body.data.accessToken;
        refreshTokenOfOwner = response.body.data.refreshToken;
    });

    it("Should return data of guest", async () => {
        // login
        const response = await request(app).post("/auth/login").send({
            username: "tmquang1",
            password: "123456",
        });

        accessTokenOfGuest = response.body.data.accessToken;
        refreshTokenOfGuest = response.body.data.refreshToken;
    });
});

describe("POST /info", () => {
    describe("Success", () => {
        it("Should return data of owner", async () => {
            const response = await request(app).get("/user/info").set("Authorization", `Bearer ${accessTokenOfOwner}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty("username");
        });

        it("Should return data of guest", async () => {
            const response = await request(app).get("/user/info").set("Authorization", `Bearer ${accessTokenOfGuest}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty("username");
        });
    });
});

describe("PUT /user/update", () => {
    it("Should return data of user", async () => {
        const response = await request(app).put("/user/update").set("Authorization", `Bearer ${accessTokenOfOwner}`).send({
            full_name: "Tran Minh Quang",
            email: "tmquang0209@gmail.com",
            phone_number: "0397847805",
            birthday: "2003-02-09",
            address: "Vinh Phuc",
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("username");
    });

    it("validation error", async () => {
        const response = await request(app).put("/user/update").set("Authorization", `Bearer ${accessTokenOfOwner}`).send({
            full_name: 123,
            email: "tmquang0209@gmail.com",
            phone_number: "0397847805",
            birthday: "2003-02-09",
            address: "Vinh Phuc",
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation Error");
    });
});

describe("PUT /user/change-password", () => {
    it("Validation error", async () => {
        const response = await request(app).put("/user/change-password").set("Authorization", `Bearer ${accessTokenOfOwner}`).send({
            old_password: "123456",
            new_password: "1234567",
            confirm_password: "12345678",
        });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(400);
    });

    it("Old password is incorrect", async () => {
        const response = await request(app).put("/user/change-password").set("Authorization", `Bearer ${accessTokenOfOwner}`).send({
            old_password: "1234567",
            new_password: "12345678",
            confirm_password: "12345678",
        });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1003);
    });

    it("Password is not match", async () => {
        const response = await request(app).put("/user/change-password").set("Authorization", `Bearer ${accessTokenOfOwner}`).send({
            old_password: "123456",
            new_password: "12345678",
            confirm_password: "1234567",
        });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(400);
    });

    it("Change password successful", async () => {
        // login
        const loginResponse = await request(app).post("/auth/login").send({
            username: "tmquang2",
            password: "123456",
        });
        const accessToken = loginResponse.body.data?.accessToken;
        const response = await request(app).put("/user/change-password").set("Authorization", `Bearer ${accessToken}`).send({
            old_password: "123456",
            new_password: "123456",
            confirm_password: "123456",
        });

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1002);
    });
});
