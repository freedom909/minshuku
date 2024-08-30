// In your models setup file or where you define associations
import Listing from './models/listing.js';
import Coordinate from './models/coordinates.js';

Listing.hasOne(Coordinate, { foreignKey: 'listingId' });
Coordinate.belongsTo(Listing, { foreignKey: 'listingId' });
