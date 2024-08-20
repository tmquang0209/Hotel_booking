import request from "supertest";
import app from "../index.js";

let accessTokenOfOwner = "";
let refreshTokenOfOwner = "";
let accessTokenOfGuest = "";
let refreshTokenOfGuest = "";
let hotelId = 12;
let roomId = 10;

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

describe("POST /room/create", () => {
    it("Validate error", async () => {
        const response = await request(app)
            .post("/room/create")
            .send({
                hotel_id: 10,
                name: Math.ceil(Math.random() * 1000),
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
    });

    it("Access is denied to guests", async () => {
        const response = await request(app)
            .post("/room/create")
            .send({
                hotel_id: 10,
                name: "Room " + Math.ceil(Math.random() * 1000),
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Room names exist in this hotel", async () => {
        const response = await request(app)
            .post("/room/create")
            .send({
                hotel_id: 10,
                name: "A101",
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1002);
    });

    it("Should create a new room", async () => {
        const response = await request(app)
            .post("/room/create")
            .send({
                hotel_id: 10,
                name: "A_" + Math.ceil(Math.random() * 1000),
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        roomId = response.body.data.id;
        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1001);
    });
});

describe("GET /room/details", () => {
    it("Access is denied to guests", async () => {
        const response = await request(app)
            .get("/room/details")
            .query({
                id: 1,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Room is not found", async () => {
        const response = await request(app)
            .get("/room/details")
            .query({
                id: 1,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1003);
    });

    it("Should return data of room", async () => {
        const response = await request(app)
            .get("/room/details")
            .query({
                id: roomId,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1004);
    });
});

describe("GET /room/list-by-house", () => {
    it("Should return data of rooms", async () => {
        const response = await request(app)
            .get("/room/list-by-house")
            .query({
                id: 10,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1006);
    });
});

describe("PUT /room/update", () => {
    it("Access is denied to guests", async () => {
        const response = await request(app)
            .put("/room/update")
            .query({
                id: 2,
            })
            .send({
                hotel_id: 2,
                name: "A101",
                price: 200000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(400);
    });

    it("Room is not found", async () => {
        const response = await request(app)
            .put("/room/update")
            .query({
                id: 1,
            })
            .send({
                hotel_id: 2,
                name: "A101",
                price: 200000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1008);
    });

    it("Should update details of room", async () => {
        const response = await request(app)
            .put("/room/update")
            .query({
                id: roomId,
            })
            .send({
                hotel_id: 2,
                name: "A" + Math.ceil(Math.random() * 1000),
                price: 200000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1009);
    });
});

describe("DELETE /room/delete", () => {
    it("Room not found or access denied", async () => {
        const response = await request(app)
            .delete("/room/delete")
            .query({
                id: 1112,
            })
            .set("Authorization", accessTokenOfOwner);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1008);
    });

    it("Delete room successful", async () => {
        const response = await request(app)
            .delete("/room/delete")
            .query({
                id: roomId,
            })
            .set("Authorization", accessTokenOfOwner);

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(1010);
    });
});
