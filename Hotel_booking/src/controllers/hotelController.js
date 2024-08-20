import HotelService from "../services/hotelService.js";
import { apiResponse } from "../utils/apiResponse.js";
import Exception from "../utils/exception.js";

export async function createHotel(req, res) {
    const { name, address, phone_number, email, status, services } = req.body;
    const user = req.user;
    try {
        const hotelData = {
            name: name,
            address: address,
            phone_number: phone_number,
            email: email,
            status: status,
            owner_id: user.id,
        };

        const newHotel = await HotelService.create(hotelData, services);

        return res.json(apiResponse(1001, "Create a new hotel successful.", newHotel));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function getDetails(req, res) {
    const { id } = req.query;
    const user = req.user;
    try {
        const details = await HotelService.getDetails(user.id, id);

        return res.json(apiResponse(1002, "Get hotel details successful.", details));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function getAllHotelByUser(req, res) {
    const user = req.user;
    try {
        const list = await HotelService.getHotelsByOwner(user.id);

        return res.json(apiResponse(1004, "Get hotel list successful.", list));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function updateHotelInfo(req, res) {
    const { id } = req.query;
    const { name, address, phone_number, email, status, services } = req.body;
    const user = req.user;
    try {
        await HotelService.checkExists(user.id, id);

        const data = {
            name: name,
            address: address,
            phone_number: phone_number,
            email: email,
            status: status,
        };

        const update = await HotelService.updateInfo(data, services, id);

        return res.json(apiResponse(1005, "Update hotel info successful.", update));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function deleteHotel(req, res) {
    const { id } = req.query;
    const user = req.user;
    try {
        await HotelService.checkExists(user.id, id);

        const deleteData = await HotelService.deleteHotel(id);
        return res.json(apiResponse(1007, "Delete hotel successful.", deleteData));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}
