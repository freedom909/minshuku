import Location from '../models/location.js'; // Import your Location model

class LocationRepository {
    constructor() {
        // No need to pass in `locationRepository` here; it's just the model
        this.model = Location;
    }

    // Define findById method properly using Sequelize's findByPk method
    async findById(id) {
        try {
            return await this.model.findByPk(id);
        } catch (error) {
            console.error('Error finding location by ID:', error);
            throw new Error(`Error finding location by ID: ${error.message}`);
        }
    }

    // You can add more methods to this repository like `findOne`, `findAll`, etc.
    async findOne(query) {
        try {
            return await this.model.findOne(query);
        } catch (error) {
            console.error('Error finding location:', error);
            throw new Error(`Error finding location: ${error.message}`);
        }
    }
}

export default LocationRepository;
