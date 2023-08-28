'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Amenities', amenitiesData, {});
    await queryInterface.bulkInsert('Listings', listingsData, {});
    await queryInterface.bulkInsert('ListingAmenities', listingAmenitiesData, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Amenities', null, {});
    await queryInterface.bulkDelete('Listings', null, {});
    await queryInterface.bulkDelete('ListingAmenities', null, {});
  }
};
