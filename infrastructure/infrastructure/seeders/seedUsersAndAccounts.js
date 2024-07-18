import fs from 'fs';
import path from 'path';
import User from '../models/user.js';
import Account from '../models/account.js';
import sequelize from '../models/seq.js';

const seedUsersAndAccounts = async () => {
  const filePath = path.resolve('seeders/users.json');
  const usersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    for (const userData of usersData) {
      // Create user with generated UUID
      const user = await User.create({
        id:userData.id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
        role: userData.role,
        picture: userData.picture,
        description: userData.description,
      });

      // Create account with the same email and password, and associate it with the user
      await Account.create({
        email: userData.email,
        password: userData.password,
        userId: user.id, // Associate account with user
      });
    }

    console.log('Users and Accounts seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
  }
};

seedUsersAndAccounts();
