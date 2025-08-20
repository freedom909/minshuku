import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import sequelize from '../models/config/seq.js';
import Listing from '../models/mysql/listing.js';
import Amenity from '../models/mysql/amenity.js';
import ListingAmenities from '../models/mysql/listingAmenities.js';
import Location from '../models/mysql/location.js';
import Category from '../models/mysql/category.js';
import ListingCategory from '../models/mysql/listingCategory.js';

async function seedDatabase() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    const locations = await loadJSON(path.join(__dirname, 'locations.json'));
    const listings = await loadJSON(path.join(__dirname, 'listings.json'));
    //const coordinates = await loadJSON(path.join(__dirname, 'coordinates.json'));
    //const bookings = await loadJSON(path.join(__dirname, 'bookings.json'));
    //const payments = await loadJSON(path.join(__dirname, 'payments.json'));
    const amenities = await loadJSON(path.join(__dirname, 'amenities.json'));
    const listingAmenities = await loadJSON(path.join(__dirname, 'listingAmenities.json'));
   
    const categories = await loadJSON(path.join(__dirname, 'categories.json'));
    const listingCategory = await loadJSON(path.join(__dirname, 'listingCategory.json'));




    

    // await seedModel(Location, locations);
    await seedModel(Listing, listings);
    // await seedModel(Coordinate, coordinates);
    //await seedModel(Booking, bookings);
    //await seedModel(Payment, payments);
    await seedModel(Amenity, amenities);
    await seedModel(ListingAmenities, listingAmenities);
    await seedModel(Location, locations);  // Ensure this model exists and is imported correctly

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();