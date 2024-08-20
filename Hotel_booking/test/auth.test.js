import request from "supertest";
import app from "../index.js";

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
            it("Username or password is incorrect", async () => {
                const response = await request(app).post("/auth/login").send({
                    username: "tmquang2222",
                    password: "123456",
                });

                expect(response.status).toBe(400);
                expect(response.body.message).toBe("Username is incorrect");
            });

            it("Password is incorrect", async () => {
                const response = await request(app).post("/auth/login").send({
                    username: "tmquang",
                    password: "test",
                });

                expect(response.status).toBe(400);
                expect(response.body.message).toBe("Password is incorrect");
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
                        confirm_password: "123456",
                        email: "unitTest@gmail.com",
                        full_name: "Tran Minh Quang",
                        address: "Vinh Phuc",
                        phone_number: "0397847805",
                        type: "OWNER",
                    });

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty("username");
            });

            it("Should return data of new user", async () => {
                const response = await request(app)
                    .post("/auth/signup")
                    .send({
                        username: "unit_" + Math.ceil(Math.random() * 10000),
                        password: "123456",
                        confirm_password: "123456",
                        email: "user@gmail.com",
                        full_name: "Tran Minh Quang",
                        address: "Vinh Phuc",
                        phone_number: "0397847805",
                        type: "GUEST",
                    });

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty("username");
            });
        });

        describe("Failure", () => {
            it("Validation error", async () => {
                const response = await request(app).post("/auth/signup").send({
                    username: "test_unit",
                    password: "123456",
                    confirm_password: "123456",
                    email: "tmquang0209@gmail.com",
                    full_name: "Tran Minh Quang",
                    address: "Vinh Phuc",
                    phone_number: "0397847805",
                    type: "OWNaER",
                });

                expect(response.status).toBe(400);
                expect(response.body.code).toBe(400);
                expect(response.body.message).toBe("Validation Error");
            });

            it("Username already exists", async () => {
                const response = await request(app).post("/auth/signup").send({
                    username: "tmquang2",
                    password: "123456",
                    confirm_password: "123456",
                    email: "tmquang0209@gmail.com",
                    full_name: "Tran Minh Quang",
                    address: "Vinh Phuc",
                    phone_number: "0397847805",
                    type: "OWNER",
                });

                expect(response.status).toBe(400);
                expect(response.body.code).toBe(1003);
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
            expect(response.body.data).toHaveProperty("accessToken");
        });

        it("Invalid token", async () => {
            const response = await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", "refreshToken=invalid_token")
                .set("Authorization", "Bearer " + accessToken);
        });

        it("Refresh token is required", async () => {
            const response = await request(app)
                .post("/auth/refresh-token")
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe(1005);
        });

        it("Invalid refresh token", async () => {
            const response = await request(app)
                .post("/auth/refresh-token")
                .set("Cookie", "refreshToken=invalid_token")
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe(1008);
        });
    });

    describe("POST /logout", () => {
        it("Should return message", async () => {
            const response = await request(app)
                .post("/auth/logout")
                .set("Cookie", "refreshToken=" + refreshToken)
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(1010);
        });

        it("Invalid refresh token", async () => {
            const response = await request(app)
                .post("/auth/logout")
                .set("Cookie", "refreshToken=" + "invalid_token")
                .set("Authorization", "Bearer " + accessToken);

            expect(response.status).toBe(400);
            expect(response.body.code).toBe(1009);
        });

        it("Invalid access token", async () => {
            const response = await request(app)
                .post("/auth/logout")
                .set("Cookie", "refreshToken=" + refreshToken)
                .set("Authorization", "Bearer " + "invalid_token");

            expect(response.status).toBe(500);
            expect(response.body.code).toBe(500);
        });
    });
});

describe("404", () => {
    it("Should return 404", async () => {
        const response = await request(app).get("/test").set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(404);
    });
});

describe("Authentication is required", () => {
    it("Should return code 1000", async () => {
        const response = await request(app).get("/user/info");
        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1000);
    });
});
