import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(db,'root','princess', {
  host: process.env.DB_HOST || 'localhost', // Make sure to also include the host
  dialect: 'mysql', // or the dialect you are using
});

console.log('db:', db, 'user:', user, 'password:', password);

export default sequelize;
