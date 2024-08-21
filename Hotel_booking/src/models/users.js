import { Model } from "objection";

class Users extends Model {
    static get tableName() {
        return "users";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["username", "password", "full_name", "email"],
            properties: {
                id: { type: "integer" },
                username: { type: "string", minLength: 1, maxLength: 10 },
                password: { type: "string", minLength: 1, maxLength: 100 },
                full_name: { type: "string", maxLength: 50 },
                email: { type: "string", maxLength: 50 },
                phone_number: { type: "string", maxLength: 11 },
                birthday: { type: "string", format: "date" },
                address: { type: "string", maxLength: 100 },
                status: { type: "boolean" },
                type: { type: "string", maxLength: 10 },
                create_at: { type: "string", format: "date-time" },
            },
        };
    }
}

export default Users;
