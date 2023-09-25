'use strict';

/** @type {import('sequelize-cli').Migration} */
import listingsData from './listings.json';
import amenitiesData from './amenities.json';
import listingAmenitiesData from './listingamenities.json';
export async function up(queryInterface, Sequelize) {
  /**
   * Add seed commands here.
   *
   * Example:
   * await queryInterface.bulkInsert('People', [{
   *   name: 'John Doe',
   *   isBetaMember: false
   * }], {});
  */
  //  const listingsData={...listingsData,createdAt: new Date(), updatedAt: new Date()}
  //  const amenitiesData={...amenitiesData,createdAt: new Date(), updatedAt: new Date()}
  //  const listingAmenitiesData={...listingAmenitiesData,createdAt: new Date(), updatedAt: new Date()}
  await queryInterface.bulkInsert('Amenities', amenitiesData, {});
  await queryInterface.bulkInsert('Listings', listingsData, {});
  await queryInterface.bulkInsert('ListingAmenities', listingAmenitiesData, {});
}
export async function down(queryInterface, Sequelize) {
  /**
   * Add commands to revert seed here.
   *
   * Example:
   * await queryInterface.bulkDelete('People', null, {});
   */
  await queryInterface.bulkDelete('Amenities', null, {});
  await queryInterface.bulkDelete('Listings', null, {});
}
