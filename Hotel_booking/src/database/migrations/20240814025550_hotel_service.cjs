/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("hotel_service", (table) => {
        table.integer("hotel_id").unsigned().references("id").inTable("hotels").onDelete("CASCADE").onUpdate("CASCADE");
        table.integer("service_id").unsigned().references("id").inTable("services").onDelete("CASCADE").onUpdate("CASCADE");
        table.datetime("create_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
