/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("booking_services", (table) => {
        table.collate("utf8_general_ci");
        table.integer("booking_id").notNullable();
        table.integer("service_id").notNullable();
        table.integer("quantity").defaultTo(1);
        table.primary(["booking_id", "service_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
