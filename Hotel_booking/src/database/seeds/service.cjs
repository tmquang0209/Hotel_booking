/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("services").del();
    await knex("services").insert([
        { name: "Ăn sáng", description: "Ăn sáng ngon miệng" },
        { name: "Xe đưa đón", description: "Xe đưa đón tiện lợi" },
        { name: "Hướng dẫn viên", description: "Hướng dẫn viên nhiệt tình" },
    ]);
};
