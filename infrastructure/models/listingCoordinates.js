// In your models setup file or where you define associations
import Listing from './models/listing.js';
import Coordinate from './models/coordinates.js';

// ListingCoordinate.init({
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     listingId: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     CoordinateId: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   }, {
//     sequelize,
//     modelName: 'ListingCoordinate', // Specify the model name explicitly
//     timestamps: true,
//   });
  
  
Listing.hasOne(models.Coordinate, { foreignKey: 'listingId', as: 'coordinate' });

Coordinate.belongsTo(Listing, { foreignKey: 'listingId' });
export default ListingCoordinate;
