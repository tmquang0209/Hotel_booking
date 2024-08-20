/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("rooms", (table) => {
        table.collate("utf8_general_ci");
        table.increments("id").primary();
        table.integer("hotel_id").unsigned();
        table.string("name").notNullable();
        table.string("type");
        table.integer("price").notNullable();
        table.string("description").nullable();
        table.integer("occupancy").defaultTo(1);
        table.datetime("create_at").notNullable();
        table.foreign("hotel_id").references("id").inTable("hotels");
        table.foreign("type").references("key").inTable("room_type");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
