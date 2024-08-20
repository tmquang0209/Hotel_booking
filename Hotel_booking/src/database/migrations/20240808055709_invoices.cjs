/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("invoices", (table) => {
        table.collate("utf8_general_ci");
        table.increments("id").primary();
        table.integer("booking_id").unsigned();
        table.integer("guest_id").unsigned();
        table.integer("total").notNullable();
        table.string("payment_method").notNullable();
        table.datetime("payment_date").notNullable();
        table.string("status").notNullable();
        table.datetime("create_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
