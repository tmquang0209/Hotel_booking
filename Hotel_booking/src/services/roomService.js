import { deleteRoom } from "../controllers/roomController.js";
import BookingRooms from "../models/bookingRooms.js";
import Hotels from "../models/hotels.js";
import Rooms from "../models/rooms.js";
import ApiException from "../utils/apiException.js";

class RoomService {
    static async checkAccess(userId, roomId) {
        const room = await Rooms.query().innerJoin("hotels").findOne({
            owner_id: userId,
            "rooms.id": roomId,
        });

        if (!room) {
            throw new ApiException(1008, "Room access denied or room not found.", null);
        }
    }

    static async checkExists(hotelId, roomName) {
        const isExists = await Rooms.query().findOne({
            hotel_id: hotelId,
            name: roomName,
        });

        if (isExists) throw new ApiException(1002, "Room names exist in this hotel.", null);
    }

    static async create(data) {
        const createRoom = await Rooms.query().insert(data);
        return createRoom;
    }

    static async getDetails(userId, roomId) {
        const details = await Rooms.query().withGraphJoined("hotel").findById(roomId);

        if (!details) {
            throw new ApiException(1003, "The room is not found.", null);
        } else if (details.hotel.owner_id !== userId) {
            throw new ApiException(1007, "Access denied.", null);
        }

        return details;
    }

    static async getByHotel(hotelId, userId = null) {
        const filter = userId ? { "hotels.id": hotelId, "hotels.owner_id": userId } : { "hotels.id": hotelId };
        const rooms = await Hotels.query().withGraphJoined("rooms").findOne(filter);

        return rooms;
    }

    static async updateDetails(roomId, data) {
        // get room details
        const room = await Rooms.query().findById(roomId);

        if (data.name !== room.name) {
            const isExists = await Rooms.query().findOne({
                hotel_id: room.hotel_id,
                name: data.name,
            });

            if (isExists) throw new ApiException(1002, "Room names exist in this hotel.", null);
        }

        // update room details
        const update = await Rooms.query().patchAndFetchById(roomId, data);

        return update;
    }

    static async deleteRoom(roomId) {
        const deleteRoom = await Rooms.query().deleteById(roomId);

        return deleteRoom > 0;
    }

    static async checkAvailability(hotelId, type, qty) {
        const isAvailable = await Rooms.query()
            .findOne({
                hotel_id: hotelId,
                type: type,
                is_booked: false,
            })
            .countDistinct("id", {
                as: "count",
            });

        if (isAvailable.count === 0 || isAvailable.count < qty) {
            throw new ApiException(1002, "Hotel is fully booked");
        }
    }
}

export default RoomService;
