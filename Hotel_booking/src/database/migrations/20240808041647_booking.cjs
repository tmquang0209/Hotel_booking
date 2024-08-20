/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("booking", (table) => {
        table.collate("utf8_general_ci");
        table.increments("id").primary();
        table.integer("guest_id").notNullable();
        table.datetime("arrival_date").defaultTo(knex.fn.now());
        table.datetime("departure_date").defaultTo(knex.fn.now());
        table.integer("num_adults").defaultTo(1);
        table.integer("num_children").defaultTo(0);
        table.datetime("create_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
