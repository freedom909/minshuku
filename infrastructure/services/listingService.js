import { RESTDataSource } from '@apollo/datasource-rest';
import { QueryTypes } from 'sequelize'; // Ensure this is imported
import { GraphQLError } from 'graphql';
import axios from 'axios';
import { shield, allow } from 'graphql-shield';
import { permissions } from '../auth/permission.js';
import ListingRepository from '../repositories/listingRepository.js';
import dotenv from 'dotenv';
import connectMysql from '../DB/connectMysqlDB.js';
import mysql from 'mysql2/promise';
import sequelize from '../models/seq.js';
import queryDatabase from '../DB/dbUtils.js'
import Listing from '../models/listing.js';
import Coordinate from '../models/coordinate.js'
import dbConfig from '../DB/dbconfig.js';


dotenv.config();

// Applying the permissions middleware
const permissionsMiddleware = shield({
  Query: {
    "*": allow,  // Allow all queries by default, customize as needed
  },
  Mutation: {
    "*": allow,  // Allow all mutations by default, customize as needed
  },
});

class ListingService {
  constructor({ listingRepository, sequelize }) {
    this.listingRepository = listingRepository;
    this.sequelize = sequelize;
  }

  willSendRequest(request) {
    if (this.context && this.context.user) {
      request.headers.set('Authorization', this.context.user.token);
    }
  }

  async hotListingsByMoneyBookingTop5() {
    const query = `
    SELECT saleAmount FROM listings ORDER BY saleAmount DESC LIMIT 5
  `;
    const listings = await this.sequelize.query(query, { type: QueryTypes.SELECT });
    return listings.map(listing => ({
      ...listing,
      saleAmount: parseFloat(listing.saleAmount.toFixed(2))
    }));
  }

  async hotListingsByNumberBookingTop5() {
    const query = `
      SELECT saleAmount,bookingNumber FROM listings ORDER BY bookingNumber DESC LIMIT 5
      `;
    const listings = await this.sequelize.query(query, { type: QueryTypes.SELECT });
    return listings.map(listing => ({
      ...listing,
      saleAmount: parseFloat(listing.saleAmount.toFixed(2)),
    }))
  }

  async getListingsForUser(userId) {
    if (!this.context.user) {
      throw new GraphQLError('You must be logged in to view listings', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    try {
      const query = `SELECT * from listing where userId=${userId}`
      return this.sequelize.query(query, { type: QueryTypes.SELECT })
    } catch (error) {
      console.error('Error fetching listings for user:', error);
      throw new GraphQLError('Error fetching listings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getAllListings() {
    try {
      const query = `
      SELECT * FROM listings
      `;
      const response = await this.sequelize.query(query, { type: QueryTypes.SELECT })
      return response
    } catch (error) {
      console.error('Error fetching all listings:', error);
      throw new GraphQLError('Error fetching listings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListingsByUser(userId) {
    try {
      const query = `SELECT * FROM listings WHERE userId=${userId}`
      const response = await this.sequelize.query(query, { type: QueryTypes.SELECT })
      if (response.data.length > 0) {
        return response.data;
      } else {
        throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      }
    } catch (e) {
      console.error('Error fetching listing by ID:', e);
      throw new GraphQLError('Error fetching listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }
  async getListingsByHost(userId) {
    try {
      const query = `SELECT * FROM listings WHERE hostId=${userId}`
      const response = await this.sequelize.query(query, { type: QueryTypes.SELECT })
      if (response.data.length > 0) {
        return response.data;
      } else {
        throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      }
    } catch (e) {
      console.error('Error fetching listing by ID:', e);
      throw new GraphQLError('Error fetching listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListingById(id) {
    // if (!this.context.user) {
    //   throw new GraphQLError('You must be logged in to view listings', { extensions: { code: 'UNAUTHENTICATED' } });
    // }

    try {
      const query = `SELECT * FROM listings WHERE id = :id`;
      const response = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { id },
      });
      if (response.length > 0) {
        return response[0]; // Return the first (and only) listing
      } else {
        throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      }
    } catch (error) {
      console.error('Error fetching listing by ID:', error);
      throw new GraphQLError('Error fetching listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }


  async searchListings({ numOfBeds, checkInDate, checkOutDate, page, limit, sortBy }) {
    if (!Number.isInteger(numOfBeds) || numOfBeds <= 0) {
      throw new Error('Number of beds must be a positive integer');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn > checkOut) {
      throw new Error('Check-in date must be before check-out date');
    }

    const checkInISO = checkIn.toISOString().slice(0, 10);
    const checkOutISO = checkOut.toISOString().slice(0, 10);

    try {
      const query = `
        SELECT * FROM listings 
        WHERE numOfBeds = :numOfBeds 
          AND checkInDate = :checkInDate 
          AND checkOutDate = :checkOutDate
        LIMIT :limit OFFSET :offset
      `;

      const response = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: {
          numOfBeds,
          checkInDate: checkInISO,
          checkOutDate: checkOutISO,
          limit: parseInt(limit, 10),
          offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new Error('Error fetching listings');
    }
  }


  // async getFeaturedListings(limit) {
  //   if (!Number.isInteger(limit) || limit <= 0) {
  //     throw new Error('Limit must be a positive integer');
  //   }
  //   try {
  //     const query = `select * from listings where isFeatured=1 LIMIT ${limit}`
  //     const response = await this.sequelize.query(query, { type: QueryTypes.SELECT });

  //     return response;
  //   } catch (error) {
  //     console.error('Error fetching featured listings:', error);
  //     throw new GraphQLError('Error fetching featured listings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  //   }
  // }

  async getFeaturedListings() {
    try {
      const listings = await this.sequelize.models.Listing.findAll({
        where: { isFeatured: true },
      });
      return listings;
    } catch (error) {
      console.error('Error fetching featured listings:', error);
      throw new Error('Error fetching featured listings');
    }
  }

  async getListing(id) {  // Updated to match the resolver method name
    try {
      const query = `SELECT * FROM listings WHERE id = :id LIMIT 1`
      const [listing] = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { id } // Using replacements to safely insert the id into the query
      });
      if (!listing) {
        throw new Error('Listing not found');
      }
      return listing;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new GraphQLError('Error fetching listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getCoordinates(listingId) {
    try {
      console.log('Fetching coordinates for listingId:', listingId); // Log the listingId being queried

      const query = `
        SELECT c.* FROM coordinates AS c
        JOIN listings AS l ON l.id = c.listingId
        WHERE l.id = :listingId
      `;
      const coordinates = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { listingId },
      });

      console.log('Coordinates result:', coordinates); // Log the result of the query

      if (!coordinates || coordinates.length === 0) {
        throw new Error('Coordinates not found');
      }

      return coordinates[0]; // Return the first coordinate object
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      throw new GraphQLError('Error fetching coordinates', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }

  async getCoordinatesByListingId(listingId) {
    try {
      console.log('Fetching coordinates for listingId:', listingId); // Log the listingId being queried

      const query = `
        SELECT c.* FROM coordinates AS c
        JOIN listings AS l ON l.id = c.listingId
        WHERE l.id = :listingId
      `;
      // const coordinates = await this.sequelize.query(query, {
      //   type: QueryTypes.SELECT,
      //   replacements: { listingId },
      // });

      const coordinates = await Listing.findOne({
        where: { id: listingId },
        include: [{ model: Coordinate, as: 'coordinates' }],
      });

      console.log('Coordinate result:', coordinates); // Log the result of the query

      if (!coordinates || coordinates.length === 0) {
        throw new Error('Coordinates not found');
      }

      return coordinates[0]; // Return the first coordinate object
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      throw new GraphQLError('Error fetching coordinates', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }


  async getAllAmenities() {
    try {
      const query = `SELECT * FROM AMENITIES`;
      const response = await this.sequelize.query(query, { type: QueryTypes.SELECT });
      console.log('Raw database response:', response);
      // Ensure the response contains data
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response from the database');
      }

      // Map the amenities and provide default values for non-nullable fields
      const amenities = response.map(amenity => ({
        ...amenity,
        id: amenity.id,
        name: amenity.name,
        // Provide a default value if category is null
        category: amenity.category ? amenity.category.replace(' ', '_').toUpperCase() : 'UNKNOWN',
      })).filter(amenity => amenity.name && amenity.category); // Filter out amenities without name or category;
      console.log('Processed amenities:', amenities);
      return amenities;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      throw new GraphQLError('Error fetching amenities', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListingsByHost(hostId) {
    try {
      const query = `
        SELECT * FROM listings WHERE hostId = :hostId
      `;
      const listings = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { hostId },
      });
      return listings;
    } catch (error) {
      console.error('Error fetching listings by host:', error);
      throw new GraphQLError('Error fetching listings by host', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async hostListings() {
    try {
      const query = `
        SELECT * FROM listings WHERE hostId = :hostId
      `;
      const listings = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { hostId },
      });
      return listings;
    } catch (error) {
      console.error('Error fetching listings by host:', error);
      throw new GraphQLError('Error fetching listings by host', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async updateListingStatus(id, listingStatus) {
    try {
      const query = `
        UPDATE listings 
        SET listingStatus = :listingStatus
        WHERE id = :id
      `;

      // Execute the update query
      const [results, metadata] = await this.sequelize.query(query, {
        type: QueryTypes.UPDATE,
        replacements: { id, listingStatus },
      });

      // Log the results for debugging
      console.log('Update query results:', results, metadata);

      // Perform a select query to fetch the updated status
      const [updatedRecord] = await this.sequelize.query(`
        SELECT listingStatus FROM listings WHERE id = :id
      `, {
        type: QueryTypes.SELECT,
        replacements: { id },
      });

      // Check if the listing was found and updated
      if (!updatedRecord) {
        throw new Error('No listing found with the given id');
      }
      return updatedRecord.listingStatus; // Return the updated status
    } catch (error) {
      console.error('Error updating listing status:', error);
      throw new GraphQLError('Error updating listing status', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }


  async deleteListing(id) {
    const pool = await dbConfig.mysql(); // Get the MySQL connection pool

    try {
      const [result] = await pool.query('DELETE FROM listings WHERE id = ?', [id]);

      console.log('Delete results:', result);

      if (result.affectedRows === 0) {
        throw new Error('No listing found with the given id');
      }

      console.log('Deleted listing with ID successfully:', id);
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw new Error('Error deleting listing');
    }
  }


  async updateListingStatus(id, listingStatus) {

    console.log('Updating listing with ID:', id, 'to status:', listingStatus); // Log the inputs
    try {
      console.log("Entering function...");

      const query = `
        UPDATE listings 
        SET listingStatus = :listingStatus
        WHERE id = :id
      `;

      const [results, metadata] = await this.sequelize.query(query, {
        type: QueryTypes.UPDATE,
        replacements: { id, listingStatus },
      });

      console.log('Update results:', results, 'Metadata:', metadata); // Log the results of the update query

      const [updatedRecord] = await this.sequelize.query(`
        SELECT listingStatus FROM listings WHERE id = :id
      `, {
        type: QueryTypes.SELECT,
        replacements: { id },
      });

      console.log('Fetched updated record:', updatedRecord); // Log the result of the select query
      const [testRecord] = await this.sequelize.query(`
        SELECT * FROM listings WHERE id = :id
      `, {
        type: QueryTypes.SELECT,
        replacements: { id },
      });

      console.log('Test record:', testRecord);

      if (!updatedRecord) {
        console.error('No listing found after update');
        return null;
      }

      return updatedRecord.listingStatus;
    } catch (error) {
      console.error('Error updating listing status:', error);
      throw new GraphQLError('Error updating listing status', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }


  async createListing({ title, description, price, locationId, hostId }) {
    if (!this.context.user) {
      throw new GraphQLError('You must be logged in to create listings', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    try {
      const response = await this.post('listings', {
        title,
        description,
        price,
        locationId,
        hostId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new GraphQLError('Error creating listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async updateListing({ listingId, listing }) {
    try {
      const response = await this.patch(`listings/${listingId}`, listing);//Error updating listing: TypeError: this.patch is not a function
      return response.data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw new GraphQLError('Error updating listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async hotListingsByMoneyBookingTop5() {
    const query = `
      SELECT saleAmount FROM listings ORDER BY saleAmount DESC LIMIT 5
    `;
    const listings = await this.sequelize.query(query, { type: QueryTypes.SELECT });
    return listings.map(listing => ({
      ...listing,
      saleAmount: parseFloat(listing.saleAmount.toFixed(2))
    }));
  }

  async getListings({ numOfBeds, page, limit, sortBy }) {
    console.log('getListings called with:', { numOfBeds, page, limit, sortBy });
    if (numOfBeds === undefined || page === undefined || limit === undefined) {
      throw new Error('Missing required parameters');
    }
    const skipValue = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    let sortOrder = 'DESC'; // default descending cost

    if (sortBy === 'COST_ASC') {
      sortOrder = 'ASC';
    }

    try {
      const query = `
      SELECT * 
      FROM listings 
      WHERE numOfBeds = :numOfBeds 
      ORDER BY costPerNight ${sortOrder}
      LIMIT :limit OFFSET :skipValue
    `;

      const response = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { numOfBeds, limit: parseInt(limit, 10), skipValue },
      });
      console.log('Listings fetched:', response); // Debugging line
      return response; // directly return the response array

    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new Error('Failed to fetch listings');
    }
  }

  async getListingsForHost(userId) {
    try {
      const query = `
        SELECT * FROM listings WHERE hostId = :userId
      `;
      const listings = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId },
      });
      return listings;
    } catch (error) {
      console.error('Error fetching listings for host:', error);
      throw new Error('Failed to fetch listings for host');
    }
  }
}

export default ListingService;
