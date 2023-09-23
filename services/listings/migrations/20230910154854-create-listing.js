'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Listings', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      costPerNight: {
        type: Sequelize.FLOAT
      },
      hostId: {
        type: Sequelize.STRING
      },
      locationType: {
        type: Sequelize.STRING
      },
      numOfBeds: {
        type: Sequelize.INTEGER
      },
      photoThumbnail: {
        type: Sequelize.STRING
      },
      isFeatured: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Listings');
  }
};