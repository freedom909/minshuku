import sequelize from './seq.js';
import User from './user.js';
import Account from './account.js';

// Define associations
User.associate = (models) => {
  User.hasOne(models.Account, {
    foreignKey: 'userId',
    as: 'account',
  });
};

const models = { User, Account };
Account.associate(models);

// Sync database
(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();
