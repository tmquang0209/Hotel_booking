import { apiResponse } from "../utils/apiResponse.js";
import Exception from "../utils/exception.js";
import HotelService from "../services/hotelService.js";
import RoomService from "../services/roomService.js";

export async function createRoom(req, res) {
    const { hotelId, name, price, description, type, occupancy, status } = req.body;
    const user = req.user;
    try {
        await HotelService.checkExists(hotelId, user.id);

        await RoomService.checkExists(hotelId, name);

        const data = {
            hotel_id: hotelId,
            name,
            price,
            description: description,
            type,
            occupancy,
            status: status,
        };

        const newRoomData = await RoomService.create(data);

        return res.json(apiResponse(1001, "Create new room successful.", newRoomData));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function getDetails(req, res) {
    const { id } = req.query;
    const user = req.user;
    try {
        const details = await RoomService.getDetails(user.id, id);

        return res.json(apiResponse(1004, "Get room details successful.", details));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function getByHouse(req, res) {
    const { id } = req.query;

    try {
        const roomsData = (await RoomService.getByHotel(id)) || null;

        return res.json(apiResponse(1006, "Get all rooms in hotel successful.", roomsData));
    } catch (error) {
        Exception.handle(error);
    }
}

export async function updateDetails(req, res) {
    const { id } = req.query;
    const { name, price, description, type, occupancy, status } = req.body;
    const user = req.user;

    try {
        await RoomService.checkAccess(user.id, id);

        const data = {
            name,
            price,
            description,
            type,
            occupancy,
            status,
        };

        // Update room details
        const update = await RoomService.updateDetails(id, data);

        return res.json(apiResponse(1009, "Room details updated successfully.", update));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function deleteRoom(req, res) {
    const { id } = req.query;
    const user = req.user;
    try {
        await RoomService.checkAccess(user.id, id);

        const deleteData = await RoomService.deleteRoom(id);

        return res.json(apiResponse(1010, "The room deleted successfully.", null));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}
