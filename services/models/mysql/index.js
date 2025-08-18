import sequelize from '../config/seq.js';
import setupAssociations from './associations.js';

// Import models so Sequelize registers them
import './listing.js';
import './location.js';
import './category.js';
import './amenity.js';
import './listingAmenities.js';

// Setup associations
setupAssociations();

// Sync DB if needed
await sequelize.sync({ alter: true });
