/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table("hotels", (table) => {
        table.integer("owner_id").unsigned().references("id").inTable("users").onUpdate("CASCADE").onDelete("CASCADE").after("status");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table("hotels", (table) => {
        table.dropForeign("owner_id");
        table.dropColumn("owner_id");
    });
};
