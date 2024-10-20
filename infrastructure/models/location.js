import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Adjust the path as necessary
import { v4 as uuidv4 } from 'uuid';

class Location extends Model { }

Location.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Use UUID as the ID type
    primaryKey: true,
  },
  listingId: {
    type: DataTypes.UUID,
    allowNull: true, // This could be nullable depending on your needs
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
  timestamps: false, // Assuming you don't need timestamps
});

export default Location;
