// services/amenityService.js
import { QueryTypes } from 'sequelize';
import Amenity from './models/mysql/amenity.js';
import Category from './models/mysql/category.js';
import Listing from './models/mysql/listing.js';
import ListingAmenities from './models/mysql/listingAmenities.js';

class AmenityService {
  constructor({ sequelize, amenityRepository, locationRepository }) {
    this.sequelize = sequelize;
    this.amenityRepository = amenityRepository;
    this.locationRepository = locationRepository;
  }

  // 🔹 Fetch all amenities
  async getAllAmenities() {
    try {
      const amenities = await this.sequelize.models.Amenity.findAll({
        include: [{ model: Category, as: 'category' }],
      });

      return amenities.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        category: a.category ? a.category.name : null,
        locationId: a.locationId,
      }));
    } catch (error) {
      console.error('Error fetching amenities:', error);
      throw new Error('Error fetching amenities');
    }
  }

  // 🔹 Fetch amenity by ID
  async getAmenityById(id) {
    try {
      const amenity = await this.sequelize.models.Amenity.findByPk(id, {
        include: [{ model: Category, as: 'category' }],
      });

      if (!amenity) throw new Error('Amenity not found');

      return amenity;
    } catch (error) {
      console.error('Error fetching amenity:', error);
      throw new Error('Error fetching amenity');
    }
  }

  // 🔹 Add a new amenity
// 🔹 Add a new amenity
async addAmenity({ name, categoryId, description, locationId }) {
  if (!name || !categoryId || !description || !locationId) {
    throw new Error('Name, category, description, and location are required');
  }

  try {
    // Validate category exists
    const category = await Category.findByPk(categoryId);
    console.log('category', category);
    if (!category) throw new Error('Invalid category ID');

    // Check duplicates
    const existingAmenity = await Amenity.findOne({
      where: { name, categoryId }, // pass ID, not object
    });
    console.log('existingAmenity', existingAmenity);
    if (existingAmenity) throw new Error('Amenity already exists');
const { id: categoryIdValue } = category;
    const amenity = await Amenity.create({
      id: `am-${Date.now()}`, // simple unique ID
      name,
      categoryId: categoryIdValue,
      description,
      locationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('amenity', amenity);
    return amenity;
  } catch (error) {
    console.error('Error adding amenity:', error);
    throw new Error('Failed to add amenity');
  }
}


  // 🔹 Ensure amenity IDs exist or create them
  async getAmenityIds(amenities) {
    if (!Array.isArray(amenities)) {
      throw new Error('Invalid amenities array');
    }

    const amenityIds = await Promise.all(
      amenities.map(async ({ name, category, description, locationId }) => {
        if (!name || !category) {
          throw new Error('Missing name or category in amenity');
        }

        const [categoryRecord] = await Category.findOrCreate({
          where: { name: category.trim() },
        });

        const [amenityRecord] = await Amenity.findOrCreate({
          where: {
            name,
            categoryId: categoryRecord.id,
            description,
            locationId,
          },
          defaults: {
            name,
            categoryId: categoryRecord.id,
            description,
            locationId,
          },
        });

        return amenityRecord.id;
      })
    );

    return amenityIds;
  }

  // 🔹 Link amenities to a listing
  async linkAmenitiesToListing(listingId, amenityIds) {
    if (!listingId || !Array.isArray(amenityIds)) {
      throw new Error('Listing ID and amenity IDs are required');
    }

    try {
      const listingAmenitiesData = amenityIds.map((amenityId) => ({
        listingId,
        amenityId,
      }));

      await ListingAmenities.bulkCreate(listingAmenitiesData, {
        ignoreDuplicates: true,
      });

      return true;
    } catch (error) {
      console.error('Error linking amenities to listing:', error);
      throw new Error('Error linking amenities to listing');
    }
  }

  // 🔹 Get all amenities for a listing
  async getAmenitiesByListingId(listingId) {
    if (!listingId) throw new Error('Listing ID is required');

    try {
      const listing = await Listing.findByPk(listingId, {
        include: [{ model: Amenity, through: ListingAmenities }],
      });

      return listing ? listing.Amenities : [];
    } catch (error) {
      console.error('Error fetching amenities for listing:', error);
      throw new Error('Failed to fetch amenities for listing');
    }
  }

  // inside AmenityService
async updateAmenity(id, { name, categoryId, description, locationId }) {
  const amenity = await Amenity.findByPk(id);
  if (!amenity) throw new Error('Amenity not found');

  if (categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) throw new Error('Invalid category ID');
  }

  await amenity.update({ name, categoryId, description, locationId });
  return amenity;
}

async deleteAmenity(id) {
  const amenity = await Amenity.findByPk(id);
  if (!amenity) throw new Error('Amenity not found');

  await amenity.destroy();
  return true;
}

}

export default AmenityService;
