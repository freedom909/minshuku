import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const sequelize = new Sequelize('air','root','princess', {
  host: 'localhost', // Make sure to also include the host
  dialect: 'mysql',
});

console.log('db:', db, 'user:', user, 'password:', password);

export default sequelize
