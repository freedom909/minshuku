import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Make sure this is at the top

console.log('DB_NAME:', process.env.DB_NAME); // Check if variables are loaded correctly
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,  // Default username and password for MySQL,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
  }
);

export default sequelize;
