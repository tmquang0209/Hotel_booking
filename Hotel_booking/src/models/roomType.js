import { Model } from "objection";

class RoomType extends Model {
    static get tableName() {
        return "room_type";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["name"],
            properties: {
                key: { type: "string" },
                name: { type: "string", minLength: 1, maxLength: 50 },
                description: { type: "string" },
                status: { type: "boolean" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }
}

export default RoomType;
