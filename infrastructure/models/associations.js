import Listing from './listing.js';
import Coordinate from './coordinate.js';

// Define the association after both models have been initialized
Listing.hasOne(Coordinate, { foreignKey: 'listingId' });
Coordinate.belongsTo(Listing, { foreignKey: 'listingId' });
