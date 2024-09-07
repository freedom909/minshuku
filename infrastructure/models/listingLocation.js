// In your models setup file or where you define associations
import Listing from './models/listing.js';
import Location from './models/location.js';

// ListingLocation.init({
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     listingId: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     LocationId: {
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
//     modelName: 'ListingLocation', // Specify the model name explicitly
//     timestamps: true,
//   });


Listing.hasOne(models.Location, { foreignKey: 'listingId', as: 'location' });

Location.belongsTo(Listing, { foreignKey: 'listingId' });
export default ListingLocation;
