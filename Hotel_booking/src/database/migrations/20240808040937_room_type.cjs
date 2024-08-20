/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("room_type", (table) => {
        table.collate("utf8_general_ci");
        table.string("key").unique().primary();
        table.string("name", 50).notNullable();
        table.string("description").notNullable();
        table.boolean("status").defaultTo(true);
        table.datetime("create_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
