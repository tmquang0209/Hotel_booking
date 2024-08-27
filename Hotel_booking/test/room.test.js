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
                hotelId: 10,
                name: Math.ceil(Math.random() * 1000),
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation error");
    });

    it("Access is denied to guests", async () => {
        const response = await request(app)
            .post("/room/create")
            .send({
                hotelId: 10,
                name: "Room " + Math.ceil(Math.random() * 1000),
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("You are not authorized to access this resource");
    });

    it("Room names exist in this hotel", async () => {
        const response = await request(app)
            .post("/room/create")
            .send({
                hotelId: 1,
                name: "A101",
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Room name already exists in this hotel");
    });

    it("Should create a new room", async () => {
        const response = await request(app)
            .post("/room/create")
            .send({
                hotelId: 1,
                name: "A_" + Math.ceil(Math.random() * 1000),
                price: 100000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        roomId = response.body.data.id;
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Create a new room successfully");
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

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("You are not authorized to access this resource");
    });

    it("Room is not found", async () => {
        const response = await request(app)
            .get("/room/details")
            .query({
                id: -1,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Room not found");
    });

    it("Should return data of room", async () => {
        const response = await request(app)
            .get("/room/details")
            .query({
                id: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Get room details successfully");
    });
});

describe("GET /room/list-by-hotel", () => {
    it("Should return data of rooms", async () => {
        const response = await request(app)
            .get("/room/list-by-hotel")
            .query({
                id: 1,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Get all rooms in hotel successfully");
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
                hotelId: 2,
                name: "A101",
                price: 200000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfGuest}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("You are not authorized to access this resource");
    });

    it("Room is not found", async () => {
        const response = await request(app)
            .put("/room/update")
            .query({
                id: 1,
            })
            .send({
                hotelId: 2,
                name: "A101",
                price: 200000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Access denied");
    });

    it("Should update details of room", async () => {
        const response = await request(app)
            .put("/room/update")
            .query({
                id: roomId,
            })
            .send({
                hotelId: 1,
                name: "A" + Math.ceil(Math.random() * 1000),
                price: 200000,
                type: "VIP",
                occupancy: 2,
            })
            .set("Authorization", `Bearer ${accessTokenOfOwner}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Room details updated successfully");
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
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Access denied");
    });

    it("Delete room successful", async () => {
        const response = await request(app)
            .delete("/room/delete")
            .query({
                id: roomId,
            })
            .set("Authorization", accessTokenOfOwner);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Room deleted successfully");
    });
});
