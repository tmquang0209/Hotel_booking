/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("services", (table) => {
        table.collate("utf8_general_ci");
        table.increments("id").primary();
        table.integer("hotel_id").unsigned();
        table.string("name").notNullable();
        table.decimal("price").notNullable();
        table.string("description").nullable();
        table.datetime("create_at").defaultTo(knex.fn.now());
        table.foreign("hotel_id").references("id").inTable("hotels");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
