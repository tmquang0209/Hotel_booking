/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("reviews", (table) => {
        table.collate("utf8_general_ci");
        table.increments("id").primary();
        table.integer("room_id").unsigned();
        table.integer("guest_id").unsigned();
        table.integer("rating").notNullable();
        table.string("comment").nullable();
        table.boolean("status").defaultTo(true);
        table.datetime("create_at").defaultTo(knex.fn.now());
        table.foreign("room_id").references("id").inTable("rooms");
        table.foreign("guest_id").references("id").inTable("guests");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
