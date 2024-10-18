import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Adjust the path as necessary
import { v4 as uuidv4 } from 'uuid';
class Location extends Model { }

Location.init({
  id: {
    type: DataTypes.UUID,         // Use UUID as the ID type
    defaultValue: uuidv4(),    // Automatically generate UUID for new records
    primaryKey: true,
  },

  listingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Listings',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  radius: {
    type: DataTypes.FLOAT,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('primary', 'secondary', 'tertiary'),
    allowNull: false,
    defaultValue: 'primary', // Add a default value
  },

}, {
  sequelize,
  modelName: 'Location',
  timestamps: false,

});
export default Location