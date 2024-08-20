import { Model } from "objection";

class Logs extends Model {
    static get tableName() {
        return "logs";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["method", "path"],
            properties: {
                id: { type: "string" },
                username: { type: "string" },
                http_code: { type: "string" },
                method: { type: "string" },
                path: { type: "string" },
                data: { type: "string" },
                description: { type: "string" },
                create_at: { type: "string" },
            },
        };
    }
}

export default Logs;
