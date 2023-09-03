'use strict';
import listingsData from './listings.json';
import amenitiesData from './amenities.json';
import listingAmenitiesData from './listingamenities.json';

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('Amenities', amenitiesData, {});
  await queryInterface.bulkInsert('Listings', listingsData, {});
  await queryInterface.bulkInsert('ListingAmenities', listingAmenitiesData, {});
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('Amenities', null, {});
  await queryInterface.bulkDelete('Listings', null, {});
}
