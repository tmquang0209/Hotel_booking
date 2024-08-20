import { Model } from "objection";
import Booking from "./booking.js";
import Rooms from "./rooms.js";

class BookingRooms extends Model {
    static get tableName() {
        return "booking_rooms";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: [],
            properties: {
                id: { type: "integer" },
                booking_id: { type: "integer" },
                room_id: { type: "integer" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }

    static get relationMappings() {
        return {
            booking: {
                relation: Model.BelongsToOneRelation,
                modelClass: Booking,
                join: {
                    from: "booking_rooms.booking_id",
                    to: "booking.id",
                },
            },
            room: {
                relation: Model.BelongsToOneRelation,
                modelClass: Rooms,
                join: {
                    from: "booking_rooms.room_id",
                    to: "room.id",
                },
            },
        };
    }
}

export default BookingRooms;
