/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table("hotels", (table) => {
        table.dropForeign("owner_id");
        table.dropColumn("owner_id");
        // table.integer("owner_id").references("id").inTable("users").onUpdate("CASCADE").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
