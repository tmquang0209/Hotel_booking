/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex("room_type").del();
    await knex("room_type").insert([
        { key: "SINGLE", name: "Phòng đơn", description: "Phòng có 1 giường, phù hợp cho 1-2 người", status: true },
        { key: "DOUBLE", name: "Phòng đôi", description: "Phòng có 2 giường, phù hợp cho 2-4 người", status: true },
        { key: "TRIPLE", name: "Phòng ba", description: "Phòng có 3 giường, phù hợp cho 3-6 người", status: true },
        { key: "QUAD", name: "Phòng tư", description: "Phòng có 4 giường, phù hợp cho 4-8 người", status: true },
        { key: "KING", name: "Phòng King", description: "Phòng có 1 giường King, phù hợp cho 2-4 người", status: true },
        { key: "QUEEN", name: "Phòng Queen", description: "Phòng có 1 giường Queen, phù hợp cho 2-4 người", status: true },
        { key: "TWIN", name: "Phòng Twin", description: "Phòng có 2 giường đơn, phù hợp cho 2-4 người", status: true },
        { key: "STUDIO", name: "Studio", description: "Phòng Studio, phù hợp cho 2-4 người", status: true },
        { key: "APARTMENT", name: "Căn hộ", description: "Căn hộ, phù hợp cho 4-8 người", status: true },
        { key: "SUITE", name: "Suite", description: "Suite, phù hợp cho 2-4 người", status: true },
        { key: "VILLA", name: "Biệt thự", description: "Biệt thự, phù hợp cho 6-12 người", status: true },
        { key: "PENTHOUSE", name: "Penthouse", description: "Penthouse, phù hợp cho 4-8 người", status: true },
        { key: "DORM", name: "Phòng tập thể", description: "Phòng tập thể, phù hợp cho 8-16 người", status: true },
        { key: "VIP", name: "VIP", description: "Phòng VIP, phù hợp cho 2-4 người", status: true },
        { key: "OTHER", name: "Khác", description: "Loại phòng khác", status: true },
    ]);
};
