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

describe("POST /booking/create", () => {
    it("Access is denied for owner", async () => {
        const response = await request(app)
            .post("/booking/create")
            .send({
                hotelId: 2,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(403);
    });

    it("Validate error", async () => {
        const response = await request(app)
            .post("/booking/create")
            .send({
                hotelId: 2,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIaP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Hotel not found", async () => {
        const response = await request(app)
            .post("/booking/create")
            .send({
                hotelId: 21111,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1006);
    });

    it("Full room", async () => {
        const response = await request(app)
            .post("/booking/create")
            .send({
                hotelId: 2,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1002);
    });

    it("Service not found", async () => {
        const response = await request(app)
            .post("/booking/create")
            .send({
                hotelId: 10,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 10110,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1003);
    });

    it("Create booking successfully", async () => {
        const response = await request(app)
            .post("/booking/create")
            .send({
                hotelId: 10,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1004);
    });
});

describe("GET /booking/details", () => {
    it("Booking not found", async () => {
        const response = await request(app)
            .get("/booking/details")
            .query({
                id: 1888,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1005);
    });

    it("Should return data of booking", async () => {
        const response = await request(app)
            .get("/booking/details")
            .query({
                id: 1,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1006);
    });
});

describe("GET /booking/list", () => {
    it("Should return data of bookings", async () => {
        const response = await request(app).get("/booking/list").set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1007);
    });
});

describe("PUT /booking/update", () => {
    it("Access is denied for guest", async () => {
        const response = await request(app)
            .put("/booking/update")
            .query({ id: 1 })
            .send({
                hotelId: 10,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                payment_method: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(403);
    });

    it("Validate error", async () => {
        const response = await request(app)
            .put("/booking/update")
            .query({ id: 1 })
            .send({
                hotelId: 10,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: "2",
                numChildren: 0,
                rooms: [
                    {
                        type: "VaIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                payment_method: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
    });

    it("Booking not found", async () => {
        const response = await request(app)
            .put("/booking/update")
            .query({
                id: -1,
            })
            .send({
                hotelId: 10,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 2,
                numChildren: 0,
                rooms: [
                    {
                        type: "VIP",
                        qty: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1005);
    });

    it("Update booking successfully", async () => {
        const response = await request(app)
            .put("/booking/update")
            .query({ id: 1 })
            .send({
                hotelId: 10,
                arrivalDate: "2024-04-28 18:00:00", //
                departureDate: "2024-04-29 15:00:00",
                numAdults: 3,
                numChildren: 1,
                rooms: [
                    {
                        type: "VIP",
                        qty: 2,
                    },
                ],
                services: [
                    {
                        id: 1,
                        quantity: 3,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1008);
    });
});

describe("PUT /booking/update-status", () => {
    it("Booking not found", async () => {
        const response = await request(app)
            .put("/booking/update-status")
            .query({
                id: 100,
            })
            .send({
                status: "CANCELLED",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1005);
    });

    it("Update status successfully", async () => {
        const response = await request(app)
            .put("/booking/update-status")
            .query({
                id: 1,
            })
            .send({
                status: "CANCELLED",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1009);
    });
});

describe("PUT /booking/update-payment", () => {
    it("Status is cancelled or completed", async () => {
        const response = await request(app)
            .put("/booking/update-payment")
            .query({
                id: 1,
            })
            .send({
                status: "FAIL",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1010);
    });

    it("Update payment successfully", async () => {
        const response = await request(app)
            .put("/booking/update-payment")
            .query({
                id: 2,
            })
            .send({
                status: "FAIL",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1011);
    });
});
