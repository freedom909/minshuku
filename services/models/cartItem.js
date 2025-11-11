import { DataTypes, Model } from 'sequelize';
import sequelize from './config/seq.js';

class CartItem extends Model {}

CartItem.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  cartId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'carts',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'listings',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: false,
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
  modelName: 'CartItem',
  tableName: 'cart_items',
  timestamps: true,
});

// Define associations
CartItem.associate = function(models) {
  CartItem.belongsTo(models.Cart, {
    foreignKey: 'cartId',
    as: 'cart',
    onDelete: 'CASCADE'
  });
  
  CartItem.belongsTo(models.Listing, {
    foreignKey: 'listingId',
    as: 'listing'
  });
};

export default CartItem;