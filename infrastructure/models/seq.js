import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('air', 'root', 'princess', {
  host: 'localhost',
  dialect: 'mysql', // or the dialect you are using
});

export default sequelize;
