import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/seq.js';
import Listing from '../mysql/listing.js';
import Amenity   from '../mysql/amenity.js';
import Category  from '../mysql/category.js';
// ... import other models

import Location from '../mysql/location.js'; // Ensure this model exists and is imported correctly

const models = { Listing };

async function loadJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function seedModel(model, data) {
  for (const item of data) {
    await model.create(item);
  }
}

async function seedDatabase() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    // const locations = await loadJSON(path.join(__dirname, 'locations.json'));
    const listings = await loadJSON(path.join(__dirname, 'listings.json'));


    // await seedModel(Location, locations);
    await seedModel(Listing, listings);


    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();