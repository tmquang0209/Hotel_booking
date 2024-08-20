import Hotels from "../models/hotels.js";
import HotelServiceModel from "../models/hotelService.js";
import ApiException from "../utils/apiException.js";

class HotelService {
    static async create(data, services) {
        const create = await Hotels.query().insert(data);

        services.forEach(async (item) => {
            const serviceData = {
                hotel_id: create.id,
                service_id: parseInt(item.id),
                price: item.price,
            };

            await HotelServiceModel.query().insert(serviceData);
        });
        const dataResponse = await Hotels.query().withGraphFetched("services").findById(create.id);

        return dataResponse;
    }

    static async getDetails(userId, hotelId) {
        const details = await Hotels.query().withGraphJoined("services").findOne({
            id: hotelId,
            owner_id: userId,
        });

        if (!details) {
            throw new ApiException(1003, "Hotel with id " + hotelId + " isn't exists.", null);
        }

        return details;
    }

    static async checkExists(hotelId, userId = null) {
        const filter = userId ? { id: hotelId, owner_id: userId } : { id: hotelId };
        const details = await Hotels.query().findOne(filter);

        if (!details) {
            throw new ApiException(1006, "Can not find this hotel.", null);
        }

        return details !== null;
    }

    static async getHotelsByOwner(userId) {
        const list = await Hotels.query().where("owner_id", userId);
        return list;
    }

    static async updateInfo(data, services, hotelId) {
        const update = await Hotels.query().patchAndFetchById(hotelId, data);

        if (services) {
            await HotelServiceModel.query().delete().where("hotel_id", hotelId);
            for (const item of services) {
                const serviceData = {
                    hotel_id: update.id,
                    service_id: parseInt(item.id),
                    price: item.price,
                };

                await HotelServiceModel.query().insert(serviceData);
            }
        }

        const dataResponse = await Hotels.query().withGraphFetched("services").findById(hotelId);

        return dataResponse;
    }

    static async deleteHotel(hotelId) {
        const deleteHotel = await Hotels.query().deleteById(hotelId);
        return deleteHotel > 0;
    }

    static async checkServiceExists(hotelId, services) {
        const availableServices = await HotelServiceModel.query()
            .whereIn("service_id", [...services.map((service) => service.id)])
            .where("hotel_id", hotelId);
        if (availableServices.length !== services.length) {
            throw new ApiException(1003, "Service not available");
        }
    }
}

export default HotelService;
