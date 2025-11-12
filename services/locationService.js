import Location from "./models/mysql/location.js";
import { Sequelize, Op } from "sequelize";
class LocationService {
    constructor({ locationRepository, sequelize }) {
        this.locationRepository = locationRepository;
        this.sequelize = sequelize;
        this.Location = this.sequelize.models.Location;
    }

    async getUnMatchLocation(filter = {}) {
        try {
            const locations = await this.Location.findAll({
                where: {
                    match: false,
                    listingId: {
                        [Op.or]: [null, ''], // Matches null or empty string
                    },
                },
                ...filter, // Allows additional filtering criteria
            });
            return locations || [];
        } catch (error) {
            console.error('Error fetching locations:', error);
            throw new Error('Failed to fetch locations');
        }
    }

    async getMatchLocation() {
        try {
            const locations = await this.Location.findAll({
                where: {
                    match: true,
                },
            });
            return locations;
        } catch (error) {
            console.error('Error fetching locations:', error);
            throw new Error('Failed to fetch locations');
        }
    }


    async getAllLocations() {
        try {
            const locations = await this.Location.findAll();
            return locations;
        } catch (error) {
            console.error('Error fetching locations:', error);
            throw new Error('Failed to fetch locations');
        }
    }
    async getLocationById(id) {
        try {
            const location = await this.Location.findByPk(id);
            return location;
        } catch (error) {
            console.error('Error fetching location by id:', error);
            throw new Error('Failed to fetch location by id');
        }
    }

    async createLocation(locationData,transaction) {
        this.transaction = transaction;
        console.log("locationData: ", locationData);
           const options = {
            transaction: this.transaction,
            logging: true,
            where: {
                id: locationData.id,
            },
        };
        return this.locationRepository.create(locationData,options);
    }

    updateLocation(input) {
        console.log('input in LocationService:', input);
        const updateData = {
            listingId: input?.listingId || undefined,
            match: input?.match,
        };
        const options = {
            transaction: this.transaction,
            logging: true,
            where: {
                id: input.id,
            },
        };
        return this.Location.update(updateData, options);
    }
    async deleteLocation(input) {
        console.log('input in LocationService:', input);
        const options = {
            transaction: this.transaction,
            logging: true,
            where: {
                id: input.id,
            },
        };
        return this.Location.destroy(options);
    }

}

export default LocationService;