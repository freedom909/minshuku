import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sequelize from '../../models/config/seq.js';
import Listing from '../../models/mysql/listing.js';
import Amenity from '../../models/mysql/amenity.js';
import ListingAmenities from '../../models/mysql/listingAmenities.js';
import Location from '../../models/mysql/location.js';
import Category from '../../models/mysql/category.js';
import ListingCategory from '../../models/mysql/listingCategory.js';

const seedData = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    console.log('Seeding data...', __dirname);
    const filePath = path.join(__dirname, 'data.json');
    console.log('Reading data from file:', filePath);
    const rawData = fs.readFileSync(filePath, 'utf8');
    console.log('File read successfully.', rawData);
    const data = JSON.parse(rawData);
    console.log('Data parsed successfully.', data);
    const { listings, amenities, listingAmenities, locations, categories, listingCategories } = data;

    // Recreate tables
    await sequelize.sync({ force: true });
    console.log('Tables recreated!');

    // Insert Locations first
    if (locations?.length) {
      await Location.bulkCreate(locations);
      console.log('Locations inserted.');
    }

    // Insert Categories
    if (categories?.length) {
      await Category.bulkCreate(categories);
      console.log('Categories inserted.');
    }

    // Insert Listings (ensure locationId exists)
    if (listings?.length) {
      await Listing.bulkCreate(listings);
      console.log('Listings inserted.');
    }

    // Insert ListingCategory join table
    if (listingCategories?.length) {
      await ListingCategory.bulkCreate(listingCategories);
      console.log('ListingCategory inserted.');
    }

    // Insert Amenities (ensure categoryId exists)
    if (amenities?.length) {
      // Validate categoryId exists in DB
      const validAmenities = amenities.filter(a => a.categoryId && categories.some(c => c.id === a.categoryId));
      await Amenity.bulkCreate(validAmenities);
      console.log('Amenities inserted.');
    }

    // Insert ListingAmenities join table
    if (listingAmenities?.length) {
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
