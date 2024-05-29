import { Sequelize, DataTypes, Model } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import config from '../config/config.json' assert { type: 'json' };

// Initialize Sequelize
const env = 'development';
const { database, user,password,host } = config[env];


const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database,
  user,
  password,
  host,
  port: 3306,
});
export default sequelize;
