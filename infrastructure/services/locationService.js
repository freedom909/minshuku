import Location from "../models/location.js";
import sequelize from "../models/seq.js";

class LocationService {
    constructor({ locationRepository, sequelize }) {
        this.locationRepository = locationRepository;
        this.sequelize = sequelize;
    }

    async getAllLocations() {
        try {
            return await this.locationRepository.findAll();
        } catch (error) {
            console.error('Error retrieving locations:', error);
            throw error;
        }
    }
    async createLocation(input) {
        const { name, latitude, longitude, address, city, state, country, zipCode, radius, type } = input;

        // Validate that required fields are provided
        if (!name || !latitude || !longitude || !address || !city || !state || !country || !zipCode || !radius || !type) {
            throw new Error('Invalid location field');
        }

        try {
            // Create new location
            const newLocation = await Location.create({
                name, latitude, longitude, address, city, state, country, zipCode, radius, type
            });

            // Log the newly created location
            console.log('New Location:', newLocation);

            // Ensure the location exists and return it
            if (!newLocation) {
                throw new Error('Location creation failed');
            }

            return {
                code: 200,
                message: 'Location created successfully',
                success: true,
                data: {
                    location: newLocation  // Return the location object
                }
            };
        } catch (error) {
            console.error('Error creating location:', error);
            throw error;
        }
    }
    async deleteLocation(id) {
        try {
            // Delete the location
            const deletedLocation = await this.locationRepository.destroy({ where: { id } });
        } catch (e) {
            console.error('Error deleting location:', e);
            throw e;
        }
    }
}
export default LocationService;