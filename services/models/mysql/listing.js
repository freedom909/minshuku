import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const Listing = sequelize.define('Listing', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  hostId: { type: DataTypes.INTEGER, allowNull: false },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Listing;