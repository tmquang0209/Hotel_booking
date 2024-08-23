import request from "supertest";
import app from "../index.js";
import { errorsCode } from "../src/enums/errorsCode.js";

let accessToken = "";
let refreshToken = "";

describe("Auth API", () => {
    describe("POST /login", () => {
        describe("Success", () => {
            it("should return token", async () => {
                const response = await request(app).post("/auth/login").send({
                    username: "tmquang",
                    password: "123456",
                });

                const cookies = response.headers["set-cookie"];
                expect(cookies).toBeDefined();
                expect(cookies.length).toBeGreaterThan(0);
                const refreshTokenC = cookies.find((cookie) => cookie.startsWith("refreshToken"));
                expect(refreshTokenC).toBeDefined();
                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty("accessToken");

                accessToken = response.body.data.accessToken;
                refreshToken = response.body.data.refreshToken;
            });
        });

        describe("Failure", () => {
            it("Username is incorrect", async () => {
                const response = await request(app).post("/auth/login").send({
                    username: "tmquang2222",
                    password: "123456",
                });
                
                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe("Username or password is incorrect");
            });

            it("Password is incorrect", async () => {
                const response = await request(app).post("/auth/login").send({
                    username: "tmquang",
                    password: "test",
                });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe("Username or password is incorrect");
            });
        });
    });

    describe("POST /signup", () => {
        describe("Success", () => {
            it("Should return data of new user", async () => {
                const response = await request(app)
                    .post("/auth/signup")
                    .send({
                        username: "unit_" + Math.ceil(Math.random() * 10000),
                        password: "123456",
                        confirmPassword: "123456",
                        email: "unitTest@gmail.com",
                        fullName: "Tran Minh Quang",
                        address: "Vinh Phuc",
                        phoneNumber: "0397847805",
                        type: "OWNER",
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe("Signup successfully");
            });
        });

        describe("Failure", () => {
            it("Validation error", async () => {
                const response = await request(app).post("/auth/signup").send({
                    username: "test_unit",
                    password: "123456",
                    confirmPassword: "123456",
                    email: "tmquang0209@gmail.com",
                    fullName: "Tran Minh Quang",
                    address: "Vinh Phuc",
                    phoneNumber: "0397847805",
                    type: "OWNaER",
                });

                expect(response.status).toBe(errorsCode.BAD_REQUEST);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe("Validation error");
            });

            it("Username already exists", async () => {
                const response = await request(app).post("/auth/signup").send({
                    username: "tmquang2",
                    password: "123456",
                    confirmPassword: "123456",
                    email: "tmquang0209@gmail.com",
                    fullName: "Tran Minh Quang",
                    address: "Vinh Phuc",
                    phoneNumber: "0397847805",
                    type: "OWNER",
                });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe("User already exists");
            });
        });
    });

    describe("POST /refresh-token", () => {
        it("Should return new access token", async () => {
            const response = await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", "refreshToken=" + refreshToken)
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Refresh token successfully");
            expect(response.body.data).toHaveProperty("accessToken");
        });

        it("Invalid refresh token", async () => {
            const response = await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", "refreshToken=invalid_token")
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(errorsCode.UNAUTHORIZED);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid refresh token");
        });

        it("Refresh token is required", async () => {
            const response = await request(app)
                .post("/auth/refresh-token")
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(errorsCode.UNAUTHORIZED);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Refresh token is required");
        });
    });

    describe("POST /logout", () => {
        it("Should return message", async () => {
            const response = await request(app)
                .post("/auth/logout")
                .set("Cookie", "refreshToken=" + refreshToken)
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Logout successfully");
        });

        it("Invalid refresh token", async () => {
            const response = await request(app)
                .post("/auth/logout")
                .set("Cookie", "refreshToken=" + "invalid_token")
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(errorsCode.UNAUTHORIZED);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Refresh token is invalid");
        });

        it("Invalid access token", async () => {
            const response = await request(app)
                .post("/auth/logout")
                .set("Cookie", "refreshToken=" + refreshToken)
                .set("Authorization", "Bearer " + "invalid_token");

            expect(response.status).toBe(errorsCode.FORBIDDEN);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Access token is invalid");
        });
    });
});

describe("404", () => {
    it("Should return 404", async () => {
        const response = await request(app).get("/test").set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(errorsCode.NOT_FOUND);
    });
});

describe("Authentication is required", () => {
    it('Should return message "Authentication header is required"', async () => {
        const response = await request(app).get("/user/info");
        expect(response.status).toBe(errorsCode.FORBIDDEN);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Authentication header is required");
    });
});
