import Booking from "../models/booking.js";
import BookingServices from "../models/bookingServices.js";
import Invoices from "../models/invoices.js";
import Rooms from "../models/rooms.js";

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

    static async addRooms(bookingId, rooms) {
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

    static async addServices(bookingId, services) {
        let totalServicePrice = 0;
        for (const service of services) {
            const serviceDetails = await HotelService.query().findOne({
                hotel_id: hotel_id,
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

    static async createInvoice(user, bookingId, total, paymentMethod) {
        const invoice = await Invoices.query().insert({
            booking_id: bookingId,
            guest_id: user.id,
            payment_method: paymentMethod,
            total: total,
            status: "PENDING",
        });

        return invoice;
    }

    static async getBookingDetails(bookingId, user) {
        if (user.type === "OWNER") {
            const details = await Booking.query().withGraphJoined("rooms").withGraphJoined("services").withGraphJoined("invoice").findOne({
                "booking.id": bookingId,
                "hotels.owner_id": user.id,
            });
            return details;
        } else if (user.type === "GUEST") {
            const details = await Booking.query().withGraphJoined("rooms").withGraphJoined("services").withGraphJoined("invoice").findOne({
                id: bookingId,
                guest_id: user.id,
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
        await Booking.query().patchAndFetchById(bookingId, {
            status,
        });

        if (["cancelled", "finished"].includes(status.toLowerCase())) {
            // get all room in booking
            const rooms = await BookingRooms.query().where("booking_id", bookingId);
            for (const room of rooms) {
                // update room status
                await Rooms.query().patchAndFetchById(room.room_id, {
                    is_booked: false,
                });
            }
        }

        const data = await Booking.query().withGraphJoined("rooms").withGraphJoined("services").withGraphJoined("invoice").findById(bookingId);

        return data;
    }
}

export default BookingService;
