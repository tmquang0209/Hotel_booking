import { Model } from "objection";
import Hotels from "./hotels.js";
import BookingRooms from "./bookingRooms.js";

class Rooms extends Model {
    static get tableName() {
        return "rooms";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["name", "type"],
            properties: {
                id: { type: "integer" },
                hotel_id: { type: "integer" },
                name: { type: "string", minLength: 1, maxLength: 50 },
                price: { type: "number" },
                description: { type: "string" },
                type: { type: "string" },
                occupancy: { type: "integer" },
                status: { type: "boolean" },
                is_booked: { type: "boolean" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }

    static get relationMappings() {
        return {
            hotel: {
                relation: Model.BelongsToOneRelation,
                modelClass: Hotels,
                join: {
                    from: "rooms.hotel_id",
                    to: "hotels.id",
                },
            },

            "booking_rooms": {
                relation: Model.HasManyRelation,
                modelClass: BookingRooms,
                join: {
                    from: "rooms.id",
                    to: "booking_rooms.room_id",
                },
            },
        };
    }

}

export default Rooms;
