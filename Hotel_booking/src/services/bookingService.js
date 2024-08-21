import Booking from "../models/booking.js";
import BookingRooms from "../models/bookingRooms.js";
import BookingServices from "../models/bookingServices.js";
import HotelServiceModel from "../models/hotelService.js";
import Invoices from "../models/invoices.js";
import Rooms from "../models/rooms.js";
import ApiException from "../utils/apiException.js";

class BookingService {
    static async createBooking(data) {
        const createBooking = await Booking.query().insert(data);
        return createBooking;
    }

    static async calculateInvoice(arrivalDate, departureDate, totalRoomPrice, totalServicePrice) {
        const days = Math.ceil(Math.abs(new Date(departureDate) - new Date(arrivalDate)) / (1000 * 60 * 60 * 24));

        const total = totalRoomPrice * days + totalServicePrice;

        return { total, days };
    }

    static async addRooms(bookingId, hotelId, rooms) {
        let totalRoomPrice = 0;
        for (const room of rooms) {
            const roomDetails = await Rooms.query()
                .where({
                    hotel_id: hotelId,
                    type: room.type,
                    is_booked: false,
                })
                .limit(room.qty);

            for (const roomDetail of roomDetails) {
                await Rooms.query().patchAndFetchById(roomDetail.id, {
                    is_booked: true,
                });
                totalRoomPrice += roomDetail.price;
                await BookingRooms.query().insert({
                    booking_id: bookingId,
                    room_id: roomDetail.id,
                });
            }
        }

        return { totalRoomPrice };
    }

    static async addServices(bookingId, hotelId, services) {
        let totalServicePrice = 0;
        for (const service of services) {
            const serviceDetails = await HotelServiceModel.query().findOne({
                hotel_id: hotelId,
                service_id: service.id,
            });

            totalServicePrice += serviceDetails.price * service.quantity;

            await BookingServices.query().insert({
                booking_id: bookingId,
                service_id: service.id,
                quantity: service.quantity,
            });
        }
        return { totalServicePrice };
    }

    static async createInvoice(bookingId, total, paymentMethod) {
        const invoice = await Invoices.query().insert({
            booking_id: bookingId,
            payment_method: paymentMethod,
            total: total,
            status: "PENDING",
        });

        return invoice;
    }

    static async getBookingDetails(bookingId, user) {
        const checkExists = await Booking.query().findById(bookingId);
        if (!checkExists) {
            throw new ApiException(1005, "Booking with id " + bookingId + " isn't exists.", null);
        }

        if (user.type === "OWNER") {
            const details = await Booking.query().withGraphJoined("rooms").withGraphJoined("services").withGraphJoined("invoice").findOne({
                "booking.id": bookingId,
            });
            // check hotel owner
            // if (details.rooms[0].hotel.owner_id !== user.id) {
            //     throw new ApiException(1005, "Access denied.", null);
            // }

            return details;
        } else if (user.type === "GUEST") {
            const details = await Booking.query().withGraphJoined("rooms").withGraphJoined("services").withGraphJoined("invoice").findOne({
                "booking.id": bookingId,
                "booking.guest_id": user.id,
            });
            return details;
        }
        throw new ApiException(1005, "Access denied.", null);
    }

    static async getBookingList(user) {
        const data = await Booking.query().withGraphJoined("rooms").withGraphJoined("services").withGraphJoined("invoice").where("booking.guest_id", user.id);
        return data;
    }

    static async deleteBookingRoom(bookingId) {
        const checkRoom = await BookingRooms.query().where("booking_id", bookingId);
        if (checkRoom.length > 0) {
            // get all room in booking
            const rooms = await BookingRooms.query().where("booking_id", bookingId);
            for (const room of rooms) {
                // update room status
                await Rooms.query().patchAndFetchById(room.room_id, {
                    is_booked: false,
                });
            }
            await BookingRooms.query().delete().where("booking_id", bookingId);
        }
    }

    static async deleteBookingService(bookingId) {
        const checkService = await BookingServices.query().where("booking_id", bookingId);
        if (checkService.length > 0) {
            await BookingServices.query().delete().where("booking_id", bookingId);
        }
    }

    static async updateBookingDetails(bookingId, data) {
        const update = await Booking.query().patchAndFetchById(bookingId, data);
        return update;
    }

    static async updateStatus(bookingId, status) {
        // check status
        
        await Booking.query().patchAndFetchById(bookingId, {
            status,
        });

        // update invoice status
        const invoice = await Invoices.query().findOne({
            booking_id: bookingId,
        });

        await invoice.$query().patchAndFetch({
            status: "REFUNDED",
        });

        if (["CANCELLED", "FINISHED"].includes(status)) {
            // get all room in booking
            const rooms = await BookingRooms.query().where("booking_id", bookingId);
            for (const room of rooms) {
                // update room status
                await Rooms.query().patchAndFetchById(room.roomId, {
                    is_booked: false,
                });
            }
        }

        const data = await Booking.query().withGraphJoined("rooms").withGraphJoined("services").withGraphJoined("invoice").findById(bookingId);

        return data;
    }
}

export default BookingService;
