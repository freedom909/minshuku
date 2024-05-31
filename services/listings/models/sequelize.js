import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import config from '../config/config.json' assert { type:'json'};

class Database {
  constructor() {
    this.sequelize = new Sequelize({
      dialect: MySqlDialect,
      ...config.development, // Assuming your config file has development configuration
      port: 3306,
    });
  }

  async syncModels() {
    await this.sequelize.sync({ alter: true }); // Adjust sync options as needed
  }

  defineModel(modelName, attributes, options = {}) {
    const extendedAttributes={
      ...attributes,
      latitude:{
        type:DataTypes.FLOAT,
        allowNull:true,
      },
      longitude:{
        type:DataTypes.FLOAT,
        allowNull:true,
      },
    }
    const model = this.sequelize.define(modelName, extendedAttributes, options);
    return model;
  }

  associateModels(models) {
    // Implement your associations here
    // Example: modelA.belongsTo(modelB);
  }
}

const database = new Database();

export default database;
