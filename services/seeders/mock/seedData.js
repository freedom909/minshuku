import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sequelize from '../../models/config/seq.js';
import Listing from '../../models/mysql/listing.js';
import Amenity from '../../models/mysql/amenity.js';
import ListingAmenities from '../../models/mysql/listingAmenities.js';
import Location from '../../models/mysql/location.js';
import Category from '../../models/mysql/category.js';

const seedData = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Load JSON data
    const filePath = path.join(__dirname, 'data.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const { listings, amenities, listingAmenities, locations, categories } = JSON.parse(rawData);

    // Drop & recreate tables
    await sequelize.sync({ force: true });
    console.log('Tables recreated!');

    // Insert Locations
    if (locations && locations.length) {
      await Location.bulkCreate(locations);
      console.log('Locations inserted.');
    }

    // Insert Listings (locationId must exist)
    if (listings && listings.length) {
      await Listing.bulkCreate(listings);
      console.log('Listings inserted.');
    }

    // Insert Categories (listingId must exist)
    if (categories && categories.length) {
      await Category.bulkCreate(categories);
      console.log('Categories inserted.');
    }

    // Insert Amenities (optional locationId)
    if (amenities && amenities.length) {
      await Amenity.bulkCreate(amenities);
      console.log('Amenities inserted.');
    }

    // Insert ListingAmenities (FKs must exist)
    if (listingAmenities && listingAmenities.length) {
      await ListingAmenities.bulkCreate(listingAmenities);
      console.log('ListingAmenities inserted.');
    }

    console.log('All seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

await seedData();
