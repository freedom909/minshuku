// seeders/seedDatabase.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/seq.js';
import Listing from '../mysql/listing.js';
import Amenity from '../mysql/amenity.js';
import Category from '../mysql/category.js';
import Location from '../mysql/location.js'; // if defined

const models = { Listing, Amenity, Category, Location };

// Helper: read JSON file
async function loadJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

// Helper: insert data
async function seedModel(model, data) {
  for (const item of data) {
    await model.create(item);
  }
}

// Main seeding function
async function seedDatabase() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    // ✅ Drop and recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ Database synced and all tables recreated.');

    // ✅ Load data
    const listings = await loadJSON(path.join(__dirname, 'listings.json'));
    // const locations = await loadJSON(path.join(__dirname, 'locations.json'));

    // ✅ Seed data
    await seedModel(Listing, listings);
    // await seedModel(Location, locations);

    console.log('🌱 Data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding process
seedDatabase();
