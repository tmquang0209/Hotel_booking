/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("logs", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
        table.string("username").nullable();
        table.string("http_code").nullable();
        table.string("method").notNullable();
        table.string("path").notNullable();
        table.string("data").nullable();
        table.string("description").nullable();
        table.datetime("create_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
