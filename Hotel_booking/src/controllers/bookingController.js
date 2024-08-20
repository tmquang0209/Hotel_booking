import Exception from "../utils/exception.js";
import ApiException from "../utils/apiException.js";
import { apiResponse } from "../utils/apiResponse.js";
import Booking from "../models/booking.js";
import BookingRooms from "../models/bookingRooms.js";
import Rooms from "../models/rooms.js";
import Invoices from "../models/invoices.js";
import HotelService from "../services/hotelService.js";
import RoomService from "../services/roomService.js";
import BookingService from "../services/bookingService.js";

// create
export async function createBooking(req, res) {
    const { hotelId, arrivalDate, departureDate, numAdults, numChildren, rooms, services, paymentMethod } = req.body;
    const user = req.user;
    let totalPrice = 0,
        totalServicePrice = 0,
        totalRoomPrice = 0;

    try {
        // check hotel
        await HotelService.checkExists(hotelId);

        // check room availability
        for (const room of rooms) {
            await RoomService.checkAvailability(hotelId, room.type, room.qty);
        }

        // check service availability
        await HotelService.checkServiceExists(hotelId, services);

        // create booking
        const bookingData = {
            guest_id: user.id,
            hotel_id: hotelId,
            arrival_date: arrivalDate,
            departure_date: departureDate,
            num_adults: numAdults,
            num_children: numChildren,
        };

        const booking = await BookingService.createBooking(bookingData);

        // create booking details
        if (rooms) {
            const roomDetails = await BookingService.addRooms(booking.id, hotelId, rooms);

            totalRoomPrice += roomDetails.totalRoomPrice;
        }

        if (services) {
            const serviceDetails = await BookingService.addServices(booking.id, hotelId, services);

            totalServicePrice += serviceDetails.totalServicePrice;
        }

        // calculate invoice
        const invoiceDetails = await BookingService.calculateInvoice(arrivalDate, departureDate, totalRoomPrice, totalServicePrice);

        totalPrice = invoiceDetails.total;
        const days = invoiceDetails.days;

        // create invoice
        await BookingService.createInvoice(user, booking.id, totalPrice, paymentMethod);

        const data = await BookingService.getBookingDetails(booking.id, user);

        return res.json(apiResponse(1004, "Booking created successfully", { ...data, room_price: totalRoomPrice, service_price: totalServicePrice, total_price: totalPrice }));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

// read
export async function getBookingDetails(req, res) {
    const { id } = req.query;
    const user = req.user;
    try {
        const data = await BookingService.getBookingDetails(id, user);

        return res.json(apiResponse(1006, "Booking details", data));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function getBookingList(req, res) {
    const user = req.user;
    try {
        const data = await BookingService.getBookingList(user);
        return res.json(apiResponse(1007, "Booking list", data));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

// update
export async function updateBooking(req, res) {
    const { id } = req.query;
    const bookingId = parseInt(id);
    const { hotelId, arrivalDate, departureDate, numAdults, numChildren, rooms, services } = req.body;
    const user = req.user;
    try {
        await HotelService.checkExists(hotelId, user.id);
        await BookingService.getBookingDetails(bookingId, user);

        const dataUpdate = {
            arrival_date: arrivalDate,
            departure_date: departureDate,
            num_adults: numAdults,
            num_children: numChildren,
        };

        await BookingService.updateBookingDetails(bookingId, dataUpdate);
        let totalRoomPrice = 0,
            totalServicePrice = 0;
        if (rooms) {
            await BookingService.deleteBookingRoom(bookingId);
            const roomDetails = await BookingService.addRooms(bookingId, hotelId, rooms);

            totalRoomPrice += roomDetails.totalRoomPrice;
        }

        if (services) {
            await BookingService.deleteBookingService(bookingId);
            const serviceDetails = await BookingService.addServices(bookingId, hotelId, services);

            totalServicePrice += serviceDetails.totalServicePrice;
        }

        const data = await BookingService.getBookingDetails(bookingId, user);

        return res.json(apiResponse(1008, "Booking updated successfully", data));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function updateStatus(req, res) {
    const { id } = req.query;
    const { status } = req.body;
    const user = req.user;
    try {
        await BookingService.getBookingDetails(id, user);

        if (["cancelled", "finished"].includes(status.toLowerCase())) {
            // get all room in booking
            const rooms = await BookingRooms.query().where("booking_id", id);
            for (const room of rooms) {
                // update room status
                await Rooms.query().patchAndFetchById(room.room_id, {
                    is_booked: false,
                });
            }
        }

        await BookingService.updateStatus(id, status);

        const data = await BookingService.getBookingDetails(id, user);

        return res.json(apiResponse(1009, "Booking status updated successfully", data));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function updatePayment(req, res) {
    const { id } = req.query;
    const { payment_method, status } = req.body;
    const user = req.user;
    try {
        // check booking status
        const booking = await Booking.query().findById(id);

        if (["cancelled", "finished"].includes(booking.status.toLowerCase())) {
            throw new ApiException(1010, "Booking already cancelled or finished");
        }
        const invoice = await Invoices.query().findOne({
            booking_id: id,
        });

        if (!invoice) {
            throw new ApiException(1010, "Invoice not found");
        }

        if (payment_method) {
            var data = await Invoices.query().patchAndFetchById(invoice.id, {
                payment_method,
            });
        }

        if (status) {
            var data = await Invoices.query().patchAndFetchById(invoice.id, {
                status,
            });
        }

        return res.json(apiResponse(1011, "Invoice updated successfully", data));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}
