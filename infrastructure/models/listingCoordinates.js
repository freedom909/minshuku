// In your models setup file or where you define associations
import Listing from './models/listing.js';
import Coordinates from './models/coordinates.js';

Listing.hasMany(Coordinates, { foreignKey: 'listingId' });
Coordinates.belongsTo(Listing, { foreignKey: 'listingId' });
