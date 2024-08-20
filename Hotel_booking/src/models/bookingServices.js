import { Model } from "objection";
import Booking from "./booking.js";
import Service from "./services.js";

class BookingServices extends Model {
    static get tableName() {
        return "booking_services";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: [],
            properties: {
                id: { type: "integer" },
                booking_id: { type: "integer" },
                service_id: { type: "integer" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }

    static get relationMappings() {
        return {
            // relation with booking
            booking: {
                relation: Model.BelongsToOneRelation,
                modelClass: Booking,
                join: {
                    from: "booking_services.booking_id",
                    to: "booking.id",
                },
            },
            // relation with service
            service: {
                relation: Model.BelongsToOneRelation,
                modelClass: Service,
                join: {
                    from: "booking_services.service_id",
                    to: "service.id",
                },
            },
        };
    }
}

export default BookingServices;
