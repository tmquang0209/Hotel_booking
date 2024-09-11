import { createRoom, getDetails, getByHouse, updateDetails, deleteRoom } from "../src/controllers/roomController";
import RoomService from "../src/services/roomService";
import HotelService from "../src/services/hotelService";
import httpMocks from "node-mocks-http";
import { expect, jest, describe, it, beforeEach } from "@jest/globals";

// Mock services
jest.mock("../src/services/roomService");
jest.mock("../src/services/hotelService");

describe("Room Controller", () => {
    let req, res, user;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();

        // User mock
        user = {
            id: 1,
            username: "testUser",
            password: "testPass",
            type: "owner",
        };

        req.user = user;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createRoom", () => {
        it("should create a room and return the room data", async () => {
            // Set up the request body
            req.body = {
                hotelId: 1,
                name: "Room 101",
                price: 200,
                description: "A luxurious room",
                type: "deluxe",
                occupancy: 2,
                status: true,
            };

            // Mock service responses
            HotelService.checkExists.mockResolvedValue(true);
            RoomService.checkExists.mockResolvedValue(false);
            const mockRoom = { id: 1, name: "Room 101" };
            RoomService.create.mockResolvedValue(mockRoom);

            // Call the controller function
            await createRoom(req, res);

            // Assertions
            expect(HotelService.checkExists).toHaveBeenCalledWith(1, user.id);
            expect(RoomService.checkExists).toHaveBeenCalledWith(1, "Room 101");
            expect(RoomService.create).toHaveBeenCalledWith({
                hotel_id: 1,
                name: "Room 101",
                price: 200,
                description: "A luxurious room",
                type: "deluxe",
                occupancy: 2,
                status: true,
            });
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Create a new room successfully",
                data: mockRoom,
            });
        });
    });

    describe("getDetails", () => {
        it("should return room details", async () => {
            // Set up the request query
            req.query = { id: 1 };

            const mockDetails = {
                id: 1,
                name: "Room 101",
            };

            // Mock the service response
            RoomService.getDetails.mockResolvedValue(mockDetails);

            // Call the controller function
            await getDetails(req, res);

            // Assertions
            expect(RoomService.getDetails).toHaveBeenCalledWith(user.id, 1);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Get room details successfully",
                data: mockDetails,
            });
        });
    });

    describe("getByHouse", () => {
        it("should return rooms by hotel", async () => {
            req.query = { id: 1 };

            const mockRooms = [
                { id: 1, name: "Room 101" },
                { id: 2, name: "Room 102" },
            ];

            // Mock service response
            RoomService.getByHotel.mockResolvedValue(mockRooms);

            // Call the controller function
            await getByHouse(req, res);

            // Assertions
            expect(RoomService.getByHotel).toHaveBeenCalledWith(1);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Get all rooms in hotel successfully",
                data: mockRooms,
            });
        });
    });

    describe("updateDetails", () => {
        it("should update room details and return the updated data", async () => {
            // Set up the request body and query
            req.query = { id: 1 };
            req.body = {
                name: "Updated Room",
                price: 300,
                description: "Updated description",
                type: "suite",
                occupancy: 3,
                status: true,
            };

            // Mock service response
            const mockUpdatedRoom = { id: 1, name: "Updated Room" };
            RoomService.updateDetails.mockResolvedValue(mockUpdatedRoom);

            // Call the controller function
            await updateDetails(req, res);

            // Assertions
            expect(RoomService.checkAccess).toHaveBeenCalledWith(user.id, 1);
            expect(RoomService.updateDetails).toHaveBeenCalledWith(1, {
                name: "Updated Room",
                price: 300,
                description: "Updated description",
                type: "suite",
                occupancy: 3,
                status: true,
            });
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Room details updated successfully",
                data: mockUpdatedRoom,
            });
        });
    });

    describe("deleteRoom", () => {
        it("should delete a room and return success", async () => {
            req.query = { id: 1 };

            // Mock service response
            RoomService.deleteRoom.mockResolvedValue(true);

            // Call the controller function
            await deleteRoom(req, res);

            // Assertions
            expect(RoomService.checkAccess).toHaveBeenCalledWith(user.id, 1);
            expect(RoomService.deleteRoom).toHaveBeenCalledWith(1);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Room deleted successfully",
                data: null,
            });
        });
    });
});
