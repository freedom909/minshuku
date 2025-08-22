import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sequelize from '../config/seq.js';

import Listing from '../mysql/listing.js';
import Amenity from '../mysql/amenity.js';
import ListingAmenities from '../mysql/listingAmenities.js';
import Location from '../mysql/location.js';
import Category from '../mysql/category.js';
import ListingCategory from '../mysql/listingCategories.js';

const seedData = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Load JSON data
    const filePath = path.join(__dirname, 'data.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const { listings, amenities, listingAmenities, locations, categories, listingCategories } =
      JSON.parse(rawData);

    // Drop & recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Tables recreated!');

    // Insert Locations
    if (locations?.length) {
      await Location.bulkCreate(locations);
      console.log('📍 Locations inserted.');
    }

    // Insert Listings (locationId must exist)
    if (listings?.length) {
      await Listing.bulkCreate(listings);
      console.log('🏠 Listings inserted.');
    }

    // Insert Categories
    if (categories?.length) {
      await Category.bulkCreate(categories);
      console.log('📂 Categories inserted.');
    }

    // Insert Amenities
    if (amenities?.length) {
      await Amenity.bulkCreate(amenities);
      console.log('🛠️ Amenities inserted.');
    }

    // Insert Listing ↔ Categories join data
    if (listingCategories?.length) {
      await ListingCategory.bulkCreate(listingCategories);
      console.log('🔗 ListingCategories inserted.');
    }

    // Insert Listing ↔ Amenities join data
    if (listingAmenities?.length) {
      await ListingAmenities.bulkCreate(listingAmenities);
      console.log('🔗 ListingAmenities inserted.');
    }

    console.log('🎉 All seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

await seedData();
