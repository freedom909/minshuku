import sequelize from './config/seq.js';
import setupAssociations from './models/associations.js';

// Import models so Sequelize registers them
import './models/listing.js';
import './models/location.js';
import './models/category.js';
import './models/amenity.js';
import './models/listingAmenities.js';

// Setup associations
setupAssociations();

// Sync DB if needed
await sequelize.sync({ alter: true });
