import { DataTypes, Model } from '@sequelize/core';
import sequelize from './seq.js'; // Adjust path as necessary
import User from './user.js'; // Ensure User model is imported

 class Account extends Model {}

Account.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize, // Here is where you provide the sequelize instance
  modelName: 'Account',
  timestamps: true,
});

Account.associate = (models) => {
  Account.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

export default Account;
