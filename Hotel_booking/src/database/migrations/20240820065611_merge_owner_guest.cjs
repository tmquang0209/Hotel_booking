/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("users", (table) => {
        table.collate("utf8_general_ci");
        table.increments("id").primary();
        table.string("username", 10).notNullable();
        table.string("password", 100).notNullable();
        table.string("full_name", 50).notNullable();
        table.string("email", 50).notNullable();
        table.string("phone_number", 11).nullable();
        table.date("birthday").nullable();
        table.string("address", 100).nullable();
        table.boolean("status").defaultTo(true);
        table.string("role", 10).defaultTo("GUEST");
        table.datetime("create_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
