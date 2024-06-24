import { Sequelize, DataTypes, Model } from 'sequelize';

const sequelize = new Sequelize('air', 'root', 'princess', {
  host: 'localhost',
  dialect: 'mysql'
});
console.log('Connection has been established successfully.');


export default sequelize;