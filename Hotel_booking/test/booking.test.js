import BookingService from "../src/services/bookingService";
import { createBooking, getBookingDetails, getBookingList, updateBooking, updatePayment, updateStatus } from "../src/controllers/bookingController";
import httpMocks from "node-mocks-http";
import { expect, jest, describe, it, beforeEach, afterEach } from "@jest/globals";
import HotelService from "../src/services/hotelService";
import RoomService from "../src/services/roomService";
import Exception from "../src/utils/exception";
import Invoices from "../src/models/invoices";
import Booking from "../src/models/booking";

jest.mock("../src/services/hotelService");
jest.mock("../src/services/roomService");
jest.mock("../src/services/bookingService");
jest.mock("../src/utils/exception");
jest.mock("../src/models/invoices");
jest.mock("../src/models/booking");

describe("Booking Controller", () => {
    let req, res, user;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
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

    describe("createBooking", () => {
        beforeEach(() => {
            req = httpMocks.createRequest({
                method: "POST",
                url: "/booking",
                body: {
                    hotelId: 1,
                    arrivalDate: "2024-04-16 14:00:00",
                    departureDate: "2024-04-20 14:00:00",
                    numAdults: 2,
                    numChildren: 0,
                    rooms: [{ type: "TWIN", qty: 1 }],
                    services: [{ id: 1, quantity: 2 }],
                    paymentMethod: "cash",
                },
            });

            res = httpMocks.createResponse();
            user = {
                id: 1,
                username: "testUser",
                password: "testPass",
                type: "owner",
            };
            req.user = user;

            jest.clearAllMocks();
        });

        it("should create a booking successfully", async () => {
            // Mock the services to simulate their behavior
            HotelService.checkExists.mockResolvedValue(true);
            RoomService.checkAvailability.mockResolvedValue(true);
            HotelService.checkServiceExists.mockResolvedValue(true);
            BookingService.createBooking.mockResolvedValue({ id: 27 });
            BookingService.addRooms.mockResolvedValue({ totalRoomPrice: 100000 });
            BookingService.addServices.mockResolvedValue({ totalServicePrice: 200000 });
            BookingService.calculateInvoice.mockResolvedValue({ total: 600000, days: 4 });
            BookingService.createInvoice.mockResolvedValue({});
            BookingService.getBookingDetails.mockResolvedValue({
                id: 27,
                guestId: 2,
                arrivalDate: "2024-04-16T07:00:00.000Z",
                departureDate: "2024-04-20T07:00:00.000Z",
                numAdults: 2,
                numChildren: 0,
                status: "pending",
                createAt: "2024-08-27T03:35:10.000Z",
                hotelId: 1,
                rooms: [
                    {
                        id: 3,
                        hotelId: 1,
                        name: "A103",
                        type: "TWIN",
                        price: 100000,
                        description: null,
                        occupancy: 2,
                        createAt: "2024-08-21T02:28:38.000Z",
                        isBooked: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        name: "Ăn sáng",
                        description: "Ăn sáng ngon miệng",
                        createAt: "2024-08-20T15:04:03.000Z",
                    },
                ],
                invoice: {
                    id: 23,
                    bookingId: 27,
                    total: 600000,
                    paymentMethod: "cash",
                    paymentDate: null,
                    status: "PENDING",
                    createAt: "2024-08-27T03:35:10.000Z",
                },
                roomPrice: 100000,
                servicePrice: 200000,
                totalPrice: 600000,
            });

            await createBooking(req, res);

            expect(HotelService.checkExists).toHaveBeenCalledWith(req.body.hotelId);
            expect(RoomService.checkAvailability).toHaveBeenCalledWith(req.body.hotelId, req.body.rooms[0].type, req.body.rooms[0].qty);
            expect(HotelService.checkServiceExists).toHaveBeenCalledWith(req.body.hotelId, req.body.services);
            expect(BookingService.createBooking).toHaveBeenCalledWith({
                guest_id: user.id,
                hotel_id: req.body.hotelId,
                arrival_date: req.body.arrivalDate,
                departure_date: req.body.departureDate,
                num_adults: req.body.numAdults,
                num_children: req.body.numChildren,
            });
            expect(BookingService.addRooms).toHaveBeenCalledWith(27, req.body.hotelId, req.body.rooms);
            expect(BookingService.addServices).toHaveBeenCalledWith(27, req.body.hotelId, req.body.services);
            expect(BookingService.calculateInvoice).toHaveBeenCalledWith(req.body.arrivalDate, req.body.departureDate, 100000, 200000);
            expect(BookingService.createInvoice).toHaveBeenCalledWith(27, 600000, req.body.paymentMethod);
            expect(BookingService.getBookingDetails).toHaveBeenCalledWith(27, user);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Booking created successfully",
                data: expect.any(Object),
            });
        });

        it("should handle errors", async () => {
            const error = new Error("Booking error");
            BookingService.createBooking.mockRejectedValue(error);

            await createBooking(req, res);

            expect(Exception.handle).toHaveBeenCalledWith(error, req, res);
        });
    });

    describe("Booking Controller - getBookingDetails", () => {
        beforeEach(() => {
            req = httpMocks.createRequest({
                method: "GET",
                url: "/booking/details",
                query: {
                    id: 27,
                },
            });

            res = httpMocks.createResponse();
            user = {
                id: 1,
                username: "testUser",
                password: "testPass",
                type: "owner",
            };
            req.user = user;

            jest.clearAllMocks();
        });

        it("should retrieve booking details successfully", async () => {
            // Mock the service to simulate behavior
            const mockBookingDetails = {
                id: 27,
                guestId: 2,
                arrivalDate: "2024-04-16T07:00:00.000Z",
                departureDate: "2024-04-20T07:00:00.000Z",
                numAdults: 2,
                numChildren: 0,
                status: "pending",
                createAt: "2024-08-27T03:35:10.000Z",
                hotelId: 1,
                rooms: [
                    {
                        id: 3,
                        hotelId: 1,
                        name: "A103",
                        type: "TWIN",
                        price: 100000,
                        description: null,
                        occupancy: 2,
                        createAt: "2024-08-21T02:28:38.000Z",
                        isBooked: 1,
                    },
                ],
                services: [
                    {
                        id: 1,
                        name: "Ăn sáng",
                        description: "Ăn sáng ngon miệng",
                        createAt: "2024-08-20T15:04:03.000Z",
                    },
                ],
                invoice: {
                    id: 23,
                    bookingId: 27,
                    total: 600000,
                    paymentMethod: "cash",
                    paymentDate: null,
                    status: "PENDING",
                    createAt: "2024-08-27T03:35:10.000Z",
                },
                roomPrice: 100000,
                servicePrice: 200000,
                totalPrice: 600000,
            };

            BookingService.getBookingDetails.mockResolvedValue(mockBookingDetails);

            await getBookingDetails(req, res);

            expect(BookingService.getBookingDetails).toHaveBeenCalledWith(req.query.id, user);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Get booking details successfully",
                data: mockBookingDetails,
            });
        });

        it("should handle errors when retrieving booking details", async () => {
            const error = new Error("Error retrieving booking details");
            BookingService.getBookingDetails.mockRejectedValue(error);

            await getBookingDetails(req, res);

            expect(Exception.handle).toHaveBeenCalledWith(error, req, res);
        });
    });

    describe("Booking Controller - getBookingList", () => {
        let req, res, user;

        beforeEach(() => {
            req = httpMocks.createRequest({
                method: "GET",
                url: "/booking/list",
            });

            res = httpMocks.createResponse();
            user = {
                id: 1,
                username: "testUser",
                password: "testPass",
                type: "owner",
            };
            req.user = user;

            jest.clearAllMocks();
        });

        it("should retrieve booking list successfully", async () => {
            // Mock the service to simulate behavior
            const mockBookingList = [
                {
                    id: 27,
                    guestId: 2,
                    arrivalDate: "2024-04-16T07:00:00.000Z",
                    departureDate: "2024-04-20T07:00:00.000Z",
                    numAdults: 2,
                    numChildren: 0,
                    status: "pending",
                    createAt: "2024-08-27T03:35:10.000Z",
                    hotelId: 1,
                    rooms: [
                        {
                            id: 3,
                            hotelId: 1,
                            name: "A103",
                            type: "TWIN",
                            price: 100000,
                            description: null,
                            occupancy: 2,
                            createAt: "2024-08-21T02:28:38.000Z",
                            isBooked: 1,
                        },
                    ],
                    services: [
                        {
                            id: 1,
                            name: "Ăn sáng",
                            description: "Ăn sáng ngon miệng",
                            createAt: "2024-08-20T15:04:03.000Z",
                        },
                    ],
                    invoice: {
                        id: 23,
                        bookingId: 27,
                        total: 600000,
                        paymentMethod: "cash",
                        paymentDate: null,
                        status: "PENDING",
                        createAt: "2024-08-27T03:35:10.000Z",
                    },
                    roomPrice: 100000,
                    servicePrice: 200000,
                    totalPrice: 600000,
                },
            ];

            BookingService.getBookingList.mockResolvedValue(mockBookingList);

            await getBookingList(req, res);

            expect(BookingService.getBookingList).toHaveBeenCalledWith(user);
            expect(res._getJSONData()).toEqual({
                success: true,
                message: "Get booking list successfully",
                data: mockBookingList,
            });
        });

        it("should handle errors when retrieving booking list", async () => {
            const error = new Error("Error retrieving booking list");
            BookingService.getBookingList.mockRejectedValue(error);

            await getBookingList(req, res);

            expect(Exception.handle).toHaveBeenCalledWith(error, req, res);
        });
    });

    describe("Booking Controller - updateBooking", () => {
        let req, res, user;

        beforeEach(() => {
            req = httpMocks.createRequest({
                method: "PUT",
                url: "/booking/update",
                query: { id: "27" },
                body: {
                    hotelId: 1,
                    arrivalDate: "2024-04-16T14:00:00",
                    departureDate: "2024-04-20T14:00:00",
                    numAdults: 2,
                    numChildren: 0,
                    rooms: [
                        {
                            type: "TWIN",
                            qty: 1,
                        },
                    ],
                    services: [
                        {
                            id: 1,
                            quantity: 2,
                        },
                    ],
                },
            });

            res = httpMocks.createResponse();
            user = {
                id: 1,
                username: "testUser",
                password: "testPass",
                type: "owner",
            };
            req.user = user;

            jest.clearAllMocks();
        });

        it("should update booking details successfully", async () => {
            const mockBookingDetails = { id: 27, hotelId: 1, numAdults: 2, numChildren: 0, status: "pending" };
            const mockUpdatedBooking = { ...mockBookingDetails, rooms: [], services: [] };

            // Mocks
            BookingService.getBookingDetails.mockResolvedValue(mockBookingDetails);
            BookingService.updateBookingDetails.mockResolvedValue();
            BookingService.deleteBookingRoom.mockResolvedValue();
            BookingService.addRooms.mockResolvedValue({ totalRoomPrice: 100000 });
            BookingService.deleteBookingService.mockResolvedValue();
            BookingService.addServices.mockResolvedValue({ totalServicePrice: 200000 });
            BookingService.getBookingDetails.mockResolvedValue(mockUpdatedBooking);

            await updateBooking(req, res);

            expect(BookingService.getBookingDetails).toHaveBeenCalledWith(27, user);
            expect(BookingService.updateBookingDetails).toHaveBeenCalledWith(27, expect.any(Object));
            expect(BookingService.deleteBookingRoom).toHaveBeenCalledWith(27);
            expect(BookingService.addRooms).toHaveBeenCalledWith(27, 1, req.body.rooms);
            expect(BookingService.deleteBookingService).toHaveBeenCalledWith(27);
            expect(BookingService.addServices).toHaveBeenCalledWith(27, 1, req.body.services);
            expect(res._getJSONData()).toEqual({ success: true, message: "Booking updated successfully", data: mockUpdatedBooking });
        });

        it("should handle errors when updating booking details", async () => {
            const error = new Error("Error updating booking details");
            BookingService.getBookingDetails.mockRejectedValue(error);

            await updateBooking(req, res);

            expect(Exception.handle).toHaveBeenCalledWith(error, req, res);
        });
    });

    describe("Booking Controller - updateStatus", () => {
        let req, res, user;

        beforeEach(() => {
            req = httpMocks.createRequest({
                method: "PUT",
                url: "/booking/update-status",
                query: { id: "27" },
                body: { status: "CONFIRMED" },
            });

            res = httpMocks.createResponse();
            user = {
                id: 1,
                username: "testUser",
                password: "testPass",
                type: "owner",
            };
            req.user = user;

            jest.clearAllMocks();
        });

        it("should update booking status successfully", async () => {
            const mockBookingDetails = { id: 27, status: "pending" };
            const updatedBookingDetails = { ...mockBookingDetails, status: "CONFIRMED" };

            // Mocks
            BookingService.getBookingDetails.mockResolvedValue(mockBookingDetails);
            BookingService.updateStatus.mockResolvedValue(updatedBookingDetails);
            BookingService.getBookingDetails.mockResolvedValue(updatedBookingDetails);

            await updateStatus(req, res);

            expect(BookingService.getBookingDetails).toHaveBeenCalledWith("27", user);
            expect(BookingService.updateStatus).toHaveBeenCalledWith("27", "CONFIRMED");
            expect(res._getJSONData()).toEqual({ success: true, message: "Booking status updated successfully", data: updatedBookingDetails });
        });

        it("should handle errors when updating booking status", async () => {
            const error = new Error("Error updating booking status");
            BookingService.getBookingDetails.mockRejectedValue(error);

            await updateStatus(req, res);

            expect(Exception.handle).toHaveBeenCalledWith(error, req, res);
        });
    });

    describe("Booking Controller - updatePayment", () => {
        let req, res, user;

        beforeEach(() => {
            req = httpMocks.createRequest({
                method: "PUT",
                url: "/booking/update-payment",
                query: { id: "27" },
                body: { payment_method: "card", status: "PAID" },
            });

            res = httpMocks.createResponse();
            user = {
                id: 1,
                username: "testUser",
                password: "testPass",
                type: "owner",
            };
            req.user = user;

            jest.clearAllMocks();
        });

        it("should update payment method and status successfully", async () => {
            const mockBooking = { id: 27, status: "PENDING" };
            const mockInvoice = { id: 23, bookingId: 27, paymentMethod: "card", status: "PAID" };

            // Mocks
            Booking.query = jest.fn().mockReturnValue({
                findById: jest.fn().mockResolvedValue(mockBooking),
            });

            Invoices.query = jest.fn().mockReturnValue({
                findOne: jest.fn().mockResolvedValue(mockInvoice),
                patchAndFetchById: jest.fn().mockResolvedValue(mockInvoice),
            });

            await updatePayment(req, res);

            expect(Booking.query().findById).toHaveBeenCalledWith("27");
            expect(Invoices.query().findOne).toHaveBeenCalledWith({ booking_id: "27" });
            expect(Invoices.query().patchAndFetchById).toHaveBeenCalledWith(mockInvoice.id, { payment_method: "card" });
            expect(Invoices.query().patchAndFetchById).toHaveBeenCalledWith(mockInvoice.id, { status: "PAID" });
            // expect(res._getJSONData()).toHaveBeenCalledWith({ success: true, message: "Payment updated successfully", data: mockInvoice });
        });

        it("should handle errors when updating payment", async () => {
            const error = new Error("Error updating payment");
            Booking.query = jest.fn().mockReturnValue({
                findById: jest.fn().mockRejectedValue(error),
            });

            await updatePayment(req, res);

            expect(Exception.handle).toHaveBeenCalledWith(error, req, res);
        });
    });
});
