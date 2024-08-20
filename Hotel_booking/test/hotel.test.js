import request from "supertest";
import app from "../index.js";

let accessTokenOfOwner = "";
let refreshTokenOfOwner = "";
let accessTokenOfGuest = "";
let refreshTokenOfGuest = "";
let hotelId = 0;

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

describe("POST /hotel/create", () => {
    it("Access is denied to guests", async () => {
        const response = await request(app)
            .post("/hotel/create")
            .send({
                name: "Hotel " + Math.ceil(Math.random() * 1000),
                address: "Ha Noi",
                phone_number: "0975385643",
                email: "hotel@gmail.com",
                services: [
                    {
                        id: 1,
                        price: 100000,
                    },
                    {
                        id: 2,
                        price: 200000,
                    },
                ],
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Validation error", async () => {
        const response = await request(app)
            .post("/hotel/create")
            .send({
                name: Math.ceil(Math.random() * 1000),
                address: "Ha Noi",
                phone_number: "0975385643",
                email: `hotel_${Math.ceil(Math.random() * 1000)}@gmail.com`,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(400);
    });

    it("Should return data of new hotel", async () => {
        const response = await request(app)
            .post("/hotel/create")
            .send({
                name: "Hotel " + Math.ceil(Math.random() * 1000),
                address: "Ha Noi",
                phone_number: "0975385643",
                email: `hotel_${Math.ceil(Math.random() * 1000)}@gmail.com`,
                services: [
                    {
                        id: 1,
                        price: 100000,
                    },
                    {
                        id: 2,
                        price: 200000,
                    },
                ],
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        hotelId = response.body.data.id;
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("id");
    });
});

describe("GET /hotel/details", () => {
    it("Access is denied to guests", async () => {
        const response = await request(app)
            .get("/hotel/details")
            .query({
                id: 1,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Hotel not found", async () => {
        const response = await request(app)
            .get("/hotel/details")
            .query({
                id: 1,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
    });

    it("Should return data of hotel", async () => {
        const response = await request(app)
            .get("/hotel/details")
            .query({
                id: hotelId,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("id");
    });
});

describe(`GET /hotel/all`, () => {
    it("Should return list of hotels", async () => {
        const response = await request(app).get("/hotel/all").set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
    });

    it("Access is denied to guests", async () => {
        const response = await request(app).get("/hotel/all").set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });
});

describe("PUT /hotel/update", () => {
    it("Access is denied to guests", async () => {
        const response = await request(app)
            .put("/hotel/update")
            .query({
                id: 10,
            })
            .send({
                name: "Hotel " + Math.ceil(Math.random() * 1000),
                address: "Ha Noi",
                phone_number: "0975385643",
                email: `hotel_${Math.ceil(Math.random() * 1000)}@gmail.com`,
                services: [
                    {
                        id: 1,
                        price: 100000,
                    },
                    {
                        id: 2,
                        price: 200000,
                    },
                ],
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Hotel not found", async () => {
        const response = await request(app).put("/hotel/update").query({ id: 1 }).set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        // expect(response.body.code).toBe(1006);
    });

    it("Should return data of updated hotel", async () => {
        const response = await request(app)
            .put("/hotel/update")
            .query({ id: hotelId })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`)
            .send({
                name: "Hotel " + Math.ceil(Math.random() * 1000),
                address: "Ha Noi",
                phone_number: "0975385643",
                email: `hotel_${Math.ceil(Math.random() * 1000)}@gmail.com`,
                services: [
                    {
                        id: 1,
                        price: 100000,
                    },
                    {
                        id: 2,
                        price: 200000,
                    },
                ],
            });

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1005);
    });
});

describe("DELETE /hotel/delete", () => {
    it("Access is denied to guests", async () => {
        const response = await request(app).delete("/hotel/delete").query({ id: 10 }).set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Hotel not found", async () => {
        const response = await request(app).delete("/hotel/delete").query({ id: 1 }).set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1006);
    });

    it("Should return success message", async () => {
        const response = await request(app).delete("/hotel/delete").query({ id: hotelId }).set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1007);
    });
});
