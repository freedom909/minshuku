'use strict';

const listingsData = require('./listings.json');
const amenitiesData = require('./amenities.json');
const listingAmenitiesData = require('./listingamenities.json');
const { UUIDV4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */

  module.exports = {
    async up(queryInterface, Sequelize) {
      const amenitiesDataWithoutCreatedAt = amenitiesData.map((record) => {
        const { createdAt, ...rest } = record;
        return rest;
      });

      
      const listingsDataWithoutCreatedAt = listingsData.map((record) => {
        const { createdAt, ...rest } = record;
        return rest;
      });

     const listingAmenitiesDataWithoutCreatedAt = listingsData.map((record) => {
        const { createdAt, ...rest } = record;
        return rest;
      });
      
      await queryInterface.bulkInsert('Amenities', amenitiesDataWithoutCreatedAt, {});
      await queryInterface.bulkInsert('Listings', listingsDataWithoutCreatedAt, {});
      await queryInterface.bulkInsert('ListingAmenities', listingAmenitiesData,  {});
      
      
  }
  
  }

  // async down (queryInterface, Sequelize) {
  //   /**
  //    * Add commands to revert seed here.
  //    *
  //    * Example:
  //    * await queryInterface.bulkDelete('People', null, {});
  //    */
  //   await queryInterface.bulkDelete('Amenities', null, {});
  //   await queryInterface.bulkDelete('Listings', null, {});
  // }

