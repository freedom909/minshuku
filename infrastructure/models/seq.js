import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const sequelize = new Sequelize('air','root','princess', {
  host: 'localhost', // Make sure to also include the host
  dialect: 'mysql', 
<<<<<<< HEAD
  port:3306
=======
>>>>>>> 423c9ada222eec0adc48468d9b684fd46ad7492d
});

console.log('db:', db, 'user:', user, 'password:', password);

export default sequelize;
