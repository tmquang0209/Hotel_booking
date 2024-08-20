import { Model } from "objection";
import Hotels from "./hotels.js";

class HotelService extends Model {
    static get tableName() {
        return "hotel_service";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["hotel_id", "service_id"],
            properties: {
                hotel_id: { type: "integer" },
                service_id: { type: "integer" },
                price: { type: "integer" },
                create_at: { type: "string" },
            },
        };
    }

    static get relationMappings() {
        return {
            hotel: {
                relation: Model.BelongsToOneRelation,
                modelClass: Hotels,
                join: {
                    from: "hotel_service.hotel_id",
                    to: "hotels.id",
                },
            },
        };
    }
}

export default HotelService;
