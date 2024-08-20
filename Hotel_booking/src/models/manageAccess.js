import { Model } from "objection";

class ManageAccess extends Model {
    static get tableName() {
        return "manage_access";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["username", "refresh_token", "access_token"],
            properties: {
                username: { type: "string" },
                refresh_token: { type: "string" },
                access_token: { type: "string" },
            },
        };
    }
}

export default ManageAccess;
