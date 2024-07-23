import { DataTypes, Model } from 'sequelize';
import sequelize from './seq.js';


export class Cart extends Model {}

Cart.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  guestId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSON, // assuming items are stored as JSON objects
    allowNull: false,
    defaultValue: [],
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Cart',
  tableName: 'carts', // specify table name if different from model name
  timestamps: true, // this will automatically add `createdAt` and `updatedAt` fields
});

export default Cart;
