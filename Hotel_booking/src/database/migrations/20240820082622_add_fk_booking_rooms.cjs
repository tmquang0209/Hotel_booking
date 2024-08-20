/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table("booking_rooms", (table) => {
        table.foreign("booking_id").references("id").inTable("booking").onDelete("CASCADE");
        table.foreign("room_id").references("id").inTable("rooms").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
