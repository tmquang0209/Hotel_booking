import { Model } from "objection";
import BookingServices from "./bookingServices.js";

class Services extends Model {
    static get tableName() {
        return "services";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["name", "price"],
            properties: {
                id: { type: "integer" },
                name: { type: "string", minLength: 1, maxLength: 50 },
                description: { type: "string" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }

    static get relationMappings() {
        return {
            // relation with booking
            booking_services: {
                relation: Model.HasManyRelation,
                modelClass: BookingServices,
                join: {
                    from: "services.id",
                    to: "booking_services.service_id",
                },
            },
        };
    }
}

export default Services;
