import { createHotel, deleteHotel, updateHotelInfo, getAllHotelByUser, getDetails } from "../src/controllers/hotelController";
import { expect, jest, describe, it, beforeEach, afterEach } from "@jest/globals";
import httpMocks from "node-mocks-http";
import HotelService from "../src/services/hotelService";

jest.mock("../src/services/hotelService");

describe("Hotel Controller", () => {
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

    describe("createHotel", () => {
        it("should create a hotel", async () => {
            req.body = {
                name: "test_hotel",
                address: "test_address",
                phoneNumber: "0123456789",
                email: "test_email",
                status: true,
                services: [{ id: 1, price: 100 }],
            };

            // Mock the HotelService to return a resolved value
            await HotelService.create.mockResolvedValue({
                id: 1,
                name: "test_hotel",
                address: "test_address",
                phoneNumber: "0123456789",
                email: "test_email",
                status: true,
                owner_id: 1,
                services: [{ id: 1, price: 100 }],
            });

            // Call the controller
            await createHotel(req, res);

            // Check the response status and data
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Create a new hotel successfully",
                data: {
                    id: 1,
                    name: "test_hotel",
                    address: "test_address",
                    phoneNumber: "0123456789",
                    email: "test_email",
                    status: true,
                    owner_id: 1,
                    services: [{ id: 1, price: 100 }],
                },
            });
        });
    });

    describe("getDetails", () => {
        it("should return hotel details", async () => {
            // Set up the request query
            req.query = { id: 1 };

            const mockDetails = {
                id: 1,
                name: "Test Hotel",
                services: [{ id: 1, price: 100 }],
            };

            // Mock the service response
            HotelService.getDetails.mockResolvedValue(mockDetails);

            // Call the controller function
            await getDetails(req, res);

            // Assertions
            expect(HotelService.getDetails).toHaveBeenCalledWith(user.id, 1);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Get hotel details successfully",
                data: mockDetails,
            });
        });
    });

    describe("getAllHotelByUser", () => {
        it("should return a list of hotels", async () => {
            const mockHotels = [
                { id: 1, name: "Test Hotel 1" },
                { id: 2, name: "Test Hotel 2" },
            ];

            // Mock the service response
            HotelService.getHotelsByOwner.mockResolvedValue(mockHotels);

            // Call the controller function
            await getAllHotelByUser(req, res);

            // Assertions
            expect(HotelService.getHotelsByOwner).toHaveBeenCalledWith(user.id);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Get hotel list successfully",
                data: mockHotels,
            });
        });
    });

    describe("updateHotelInfo", () => {
        it("should update hotel info and return updated hotel data", async () => {
            // Set up the request body and query
            req.query = { id: 1 };
            req.body = {
                name: "Updated Hotel",
                address: "Updated Address",
                phoneNumber: "0987654321",
                email: "updated@example.com",
                status: true,
                services: [{ id: 1, price: 200 }],
            };

            // Mock the service response
            const mockUpdatedHotel = {
                id: 1,
                name: "Updated Hotel",
                address: "Updated Address",
                phone_number: "0987654321",
                email: "updated@example.com",
                status: true,
                services: [{ id: 1, price: 200 }],
            };

            HotelService.updateInfo.mockResolvedValue(mockUpdatedHotel);

            // Call the controller function
            await updateHotelInfo(req, res);

            // Assertions
            expect(HotelService.checkExists).toHaveBeenCalledWith(1, user.id);
            expect(HotelService.updateInfo).toHaveBeenCalledWith(
                {
                    name: "Updated Hotel",
                    address: "Updated Address",
                    phone_number: "0987654321",
                    email: "updated@example.com",
                    status: true,
                },
                [{ id: 1, price: 200 }],
                1
            );
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Update hotel info successfully",
                data: mockUpdatedHotel,
            });
        });
    });

    describe("deleteHotel", () => {
        it("should delete a hotel and return success", async () => {
            req.query = { id: 1 };

            // Mock the service response
            HotelService.deleteHotel.mockResolvedValue(true);

            // Call the controller function
            await deleteHotel(req, res);

            // Assertions
            expect(HotelService.checkExists).toHaveBeenCalledWith(1, user.id);
            expect(HotelService.deleteHotel).toHaveBeenCalledWith(1);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Delete hotel successfully",
                data: true,
            });
        });
    });
});
