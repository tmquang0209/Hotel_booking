/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table("booking_services", (table) => {
        table.foreign("booking_id").references("id").inTable("booking").onDelete("CASCADE");
        table.foreign("service_id").references("id").inTable("services").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
