import { Model } from "objection";
import Rooms from "./rooms.js";
import HotelService from "./hotelService.js";

class Hotels extends Model {
    static get tableName() {
        return "hotels";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["name", "phone_number", "address", "email"],
            properties: {
                id: { type: "integer" },
                name: { type: "string", minLength: 1, maxLength: 50 },
                address: { type: "string", minLength: 1, maxLength: 100 },
                phone_number: { type: "string", minLength: 1, maxLength: 11 },
                email: { type: "string", minLength: 1, maxLength: 50 },
                status: { type: "boolean" },
                owner_id: { type: "integer" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }

    static get relationMappings() {
        return {
            rooms: {
                relation: Model.HasManyRelation,
                modelClass: Rooms,
                join: {
                    from: this.tableName + ".id",
                    to: Rooms.tableName + ".hotel_id",
                },
            },

            services: {
                relation: Model.HasManyRelation,
                modelClass: HotelService,
                join: {
                    from: this.tableName + ".id",
                    to: HotelService.tableName + ".hotel_id",
                },
            },
        };
    }
}

export default Hotels;
