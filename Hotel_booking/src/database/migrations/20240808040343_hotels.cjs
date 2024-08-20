/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("hotels", (table) => {
        table.collate("utf8_general_ci");
        table.increments("id").primary();
        table.string("name", 50).notNullable();
        table.string("address", 100).notNullable();
        table.string("phone_number", 11).notNullable();
        table.string("email", 50).notNullable();
        table.boolean("status").defaultTo(true);
        table.integer("owner_id").unsigned();
        table.foreign("owner_id").references("id").inTable("owners");
        table.datetime("create_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
