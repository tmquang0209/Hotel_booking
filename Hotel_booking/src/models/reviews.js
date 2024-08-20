import { Model } from "objection";

class Reviews extends Model {
    static get tableName() {
        return "reviews";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: [],
            properties: {
                id: { type: "integer" },
                guest_id: { type: "integer" },
                rating: { type: "integer" },
                comment: { type: "string" },
                status: { type: "boolean" },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }
}
