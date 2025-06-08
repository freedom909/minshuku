import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js';

class Picture extends Model { }

Picture.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  listingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Listings',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Picture',
});

export default Picture;