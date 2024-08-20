/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("booking_rooms", (table) => {
        table.collate("utf8_general_ci");
        table.integer("booking_id").notNullable();
        table.integer("room_id").notNullable();
        table.datetime("create_at").defaultTo(knex.fn.now());
        table.primary(["booking_id", "room_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
