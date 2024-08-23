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

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("You are not authorized to access this resource");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation error");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Hotel not found");
    });

    it("Full room", async () => {
        const response = await request(app)
            .post("/booking/create")
            .send({
                hotelId: 1,
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Hotel is fully booked");
    });

    it("Service not found", async () => {
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
                        id: 10110,
                        quantity: 2,
                    },
                ],
                paymentMethod: "cash",
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Service not available");
    });

    it("Create booking successfully", async () => {
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

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Booking created successfully");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Booking not found");
    });

    it("Should return data of booking", async () => {
        const response = await request(app)
            .get("/booking/details")
            .query({
                id: 1,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Get booking details successfully");
    });
});

describe("GET /booking/list", () => {
    it("Should return data of bookings", async () => {
        const response = await request(app).get("/booking/list").set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Get booking list successfully");
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

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("You are not authorized to access this resource");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation error");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Booking not found");
    });

    it("Update booking successfully", async () => {
        const response = await request(app)
            .put("/booking/update")
            .query({ id: 2 })
            .send({
                hotelId: 1,
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
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Booking updated successfully");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Booking not found");
    });

    it("Update status successfully", async () => {
        const response = await request(app)
            .put("/booking/update-status")
            .query({
                id: 2,
            })
            .send({
                status: "STAYING",
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Booking status updated successfully");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Booking already cancelled or finished");
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
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Invoice updated successfully");
    });
});
