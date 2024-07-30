import Amenity from './models/Amenity.js';
import ListingAmenities from '../models/ListingAmenities.js';

class AmenityRepository {
  async findAmenitiesByName(amenities) {
    return await Amenity.findAll({
      where: {
        name: amenities,
      },
      attributes: ['id'],
    });
  }

  async createAmenity(amenity) {
    return await Amenity.create(amenity);
  }

  async findAllAmenities() {
    return await Amenity.findAll();
  }

  async bulkCreateListingAmenities(listingAmenities) {
    return await ListingAmenities.bulkCreate(listingAmenities);
  }
}

export default new AmenityRepository();
