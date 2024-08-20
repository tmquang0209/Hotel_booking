import { Model } from "objection";
import Rooms from "./rooms.js";
import Services from "./services.js";
import Invoices from "./invoices.js";

class Booking extends Model {
    static get tableName() {
        return "booking";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: [],
            properties: {
                id: { type: "integer" },
                hotel_id: { type: "integer" },
                guest_id: { type: "integer" },
                arrival_date: { type: "string", format: "date-time" },
                departure_date: { type: "string", format: "date-time" },
                num_adults: { type: "integer" },
                num_children: { type: "integer" },
                status: { type: "string" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }

    static get relationMappings() {
        return {
            rooms: {
                relation: Model.ManyToManyRelation,
                modelClass: Rooms,
                join: {
                    from: "booking.id",
                    through: {
                        from: "booking_rooms.booking_id",
                        to: "booking_rooms.room_id",
                    },
                    to: "rooms.id",
                },
            },
            services: {
                relation: Model.ManyToManyRelation,
                modelClass: Services,
                join: {
                    from: "booking.id",
                    through: {
                        from: "booking_services.booking_id",
                        to: "booking_services.service_id",
                    },
                    to: "services.id",
                },
            },
            invoice: {
                relation: Model.HasOneRelation,
                modelClass: Invoices,
                join: {
                    from: "booking.id",
                    to: "invoices.booking_id",
                },
            },
        };
    }
}

export default Booking;
