'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ListingAmenities', {
      // id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, defaultValue: DataTypes.UUIDV4 },
      ListingId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Listings',
          key: 'id',
        },
      },
      AmenityId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Amenities',
          key: 'id',
        },
      },
    
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ListingAmenities');
  }
};