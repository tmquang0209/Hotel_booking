import HotelService from "../services/hotelService.js";
import { apiResponse } from "../utils/apiResponse.js";
import Exception from "../utils/exception.js";

export async function createHotel(req, res) {
    const { name, address, phoneNumber, email, status, services } = req.body;
    const user = req.user;
    try {
        const hotelData = {
            name: name,
            address: address,
            phone_number: phoneNumber,
            email: email,
            status: status,
            owner_id: user.id,
        };

        const newHotel = await HotelService.create(hotelData, services);

        return res.json(apiResponse(1022, true, newHotel));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function getDetails(req, res) {
    const { id } = req.query;
    const user = req.user;
    try {
        const details = await HotelService.getDetails(user.id, id);

        return res.json(apiResponse(1023, true, details));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function getAllHotelByUser(req, res) {
    const user = req.user;
    try {
        const list = await HotelService.getHotelsByOwner(user.id);

        return res.json(apiResponse(1024, true, list));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function updateHotelInfo(req, res) {
    const { id } = req.query;
    const { name, address, phoneNumber, email, status, services } = req.body;
    const user = req.user;
    try {
        await HotelService.checkExists(id, user.id);

        const data = {
            name: name,
            address: address,
            phone_number: phoneNumber,
            email: email,
            status: status,
        };

        const update = await HotelService.updateInfo(data, services, id);

        return res.json(apiResponse(1025, true, update));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}

export async function deleteHotel(req, res) {
    const { id } = req.query;
    const user = req.user;
    try {
        await HotelService.checkExists(id, user.id);

        const deleteData = await HotelService.deleteHotel(id);
        return res.json(apiResponse(1026, true, deleteData));
    } catch (error) {
        Exception.handle(error, req, res);
    }
}
