import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js';

class Location extends Model {}

Location.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  zip: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  radius: { type: DataTypes.FLOAT, allowNull: true },
  units: { type: DataTypes.STRING, allowNull: true },
}, {
  sequelize,
  modelName: 'Location',
});

export default Location;
