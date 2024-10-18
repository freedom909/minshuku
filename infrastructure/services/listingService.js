import { RESTDataSource } from '@apollo/datasource-rest';
import { QueryTypes, literal, fn, Op } from 'sequelize'; // Ensure this is imported
import { GraphQLError } from 'graphql';
import { GraphQLClient } from 'graphql-request';
import { shield, allow } from 'graphql-shield';
import { permissions } from '../auth/permission.js';
import ListingRepository from '../repositories/listingRepository.js';
import dotenv from 'dotenv';
import connectMysql from '../DB/connectMysqlDB.js';
import mysql from 'mysql2/promise';
import sequelize from '../models/seq.js';
import queryDatabase from '../DB/dbUtils.js'
import Listing from '../models/listing.js';
import Amenity from '../models/amenity.js';
import validateListing from '../helpers/validateListing.js';
import ListingAmenities from '../models/listingAmenities.js';
import Coordinate from '../models/location.js'
import dbConfig from '../DB/dbconfig.js';
import Location from '../models/location.js';
import { v4 as uuidv4 } from 'uuid';


dotenv.config();

// Applying the permissions middleware
// const permissionsMiddleware = shield({
//   Query: {
//     "*": allow,  // Allow all queries by default, customize as needed
//   },
//   Mutation: {
//     "*": allow,  // Allow all mutations by default, customize as needed
//   },
// });
// // or wherever your GraphQL endpoint is

class ListingService {
  constructor({ listingRepository, sequelize }) {
    this.listingRepository = listingRepository;
    this.sequelize = sequelize;
    this.graphQLClient = new GraphQLClient('http://localhost:4040/graphql');; // Your GraphQL endpoint
  }

  willSendRequest(request) {
    if (this.context && this.context.user) {
      request.headers.set('Authorization', this.context.user.token);
    }
  }

  async findNearbyListings({ longitude, latitude, radius }) {

    const earthRadiusInKm = 6371;

    // Using Haversine formula
    const nearbyListings = await this.listingRepository.findAll({
      attributes: {
        include: [
          'id', 'title', 'description', 'costPerNight', 'hostId', 'locationId', 'numOfBeds', 'pictures', 'isFeatured', 'saleAmount',
          [
            literal(`
              (
                ${earthRadiusInKm} * ACOS(
                  COS(RADIANS(:latitude)) * COS(RADIANS(location.latitude)) *
                  COS(RADIANS(location.longitude) - RADIANS(:longitude)) +
                  SIN(RADIANS(:latitude)) * SIN(RADIANS(location.latitude))
                )
              )
            `),
            'distance'
          ],
        ],
      },
      include: [
        {
          model: Location,
          required: true,
          as: 'location',
          attributes: ['latitude', 'longitude'], // only include necessary fields
        },
      ],
      where: literal(`
        (
          ${earthRadiusInKm} * ACOS(
            COS(RADIANS(:latitude)) * COS(RADIANS(location.latitude)) *
            COS(RADIANS(location.longitude) - RADIANS(:longitude)) +
            SIN(RADIANS(:latitude)) * SIN(RADIANS(location.latitude))
          )
        ) <= :radius
      `),
      replacements: { latitude, longitude, radius },
    });

    console.log(`nearbyListings:`, JSON.stringify(nearbyListings));

    // nearbyListings.forEach(listing => {
    //   if (!listing.location.latitude || !listing.location.longitude) {
    //     console.log(`No location data for listing: ${listing.id}`);
    //   }
    // });

    if (!nearbyListings || nearbyListings.length === 0) {
      console.log('No nearby listings found');
      return [];
    }
    const formattedListings = nearbyListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      costPerNight: listing.costPerNight,
      numOfBeds: listing.numOfBeds,
      locationType: listing.locationType,
      pictures: listing.pictures,
      distance: listing.dataValues.distance,  // Include the calculated distance
    }));
    return formattedListings;
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

  async getLocationByCity(city) {
    try {
      // Query the repository to find the location by city
      const location = await this.locationRepository.findOne({ where: { city } });

      if (!location) {
        throw new Error(`Location not found for city: ${city}`);
      }

      return location;
    } catch (error) {
      console.error('Error in getLocationByCity:', error);
      throw new Error('Unable to fetch location');
    }
  }

  async getAllListings() {
    try {
      const listings = await Listing.findAll({
        include: [
          {
            model: Location, // Assuming you have a Location model
            as: 'location', // Use the proper alias if needed
          },
          {
            model: Amenity, // Assuming you have an Amenity model
            as: 'amenities', // Use the proper alias if needed
          }
        ],
      });
      return listings;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new GraphQLError('Error fetching listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
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
    try {
      const listing = await this.sequelize.models.Listing.findByPk(id, {
        include: [{
          model: this.sequelize.models.Location,
          as: 'locations'  // Use alias defined in the association
        }]
      });

      if (!listing) {
        throw new Error('Listing not found');
      }

      return listing;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new GraphQLError('Error fetching listing', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
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
      return await Listing.findByPk(id, {
        include: [
          {
            model: Amenity,
            as: 'amenities' // Adjust this to match your association
          },
          {
            model: Location,
            as: 'location'  // Adjust this to match your association
          }
        ]
      });
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
  async getTotalCost({ listingId, checkInDate, checkOutDate }) {
    // if (!listingId || !checkInDate || !checkOutDate) {
    //   throw new Error('Listing ID, check-in, and check-out dates are required');
    // }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error('Invalid dates provided');
    }

    if (checkIn >= checkOut) {
      throw new Error('Check-in date must be before check-out date');
    }

    // Generate a unique cache key using listingId, checkInDate, and checkOutDate
    const cacheKey = `totalCost:${listingId}:${checkInDate}:${checkOutDate}`;

    try {
      // Check cache for existing total cost
      const cachedTotalCost = await cacheClient.get(cacheKey);
      if (cachedTotalCost) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return { totalCost: cachedTotalCost };
      }

      // If no cache, fetch total cost from the database
      const listing = await Listing.findByPk(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Difference in days
      const totalCost = totalDays * listing.pricePerDay;

      // Cache the total cost for 1 hour (3600 seconds)
      await cacheClient.set(cacheKey, totalCost, 3600);

      return { totalCost };
    } catch (error) {
      console.error('Error fetching total cost:', error);
      throw new GraphQLError('Error fetching total cost', {
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

      // Provide a default value if category is null
      const amenities = response.map(amenity => ({
        id: amenity.id, // Explicitly map the required fields
        name: amenity.name,
        // Ensure category has a valid value or default to 'UNKNOWN'
        category: amenity.category
          ? amenity.category.replace(' ', '_').toUpperCase()
          : 'UNKNOWN',
      }));
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

  async getAmenitiesForListing(listingId) {
    try {
      const query = `
        SELECT a.* 
        FROM AMENITIES a
        JOIN LISTINGAMENITIES la ON la.amenityId = a.id
        WHERE la.listingId = :listingId
      `;
      const response = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { listingId }
      });

      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response from the database');
      }

      const amenities = response.map(amenity => ({
        id: amenity.id,
        name: amenity.name,
        category: amenity.category ? amenity.category.replace(' ', '_').toUpperCase() : 'UNKNOWN',
      }));

      return amenities;
    } catch (error) {
      console.error('Error fetching amenities for listing:', error);
      throw new GraphQLError('Error fetching amenities for listing', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
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


  async getTop5Listings() {
    const pool = await dbConfig.mysql(); // Get the MySQL connection pool

    try {
      const [rows] = await pool.query('SELECT * FROM listings ORDER BY rating DESC LIMIT 5');

      console.log('Top 5 listings:', rows);

      return rows;
    } catch (error) {
      console.error('Error fetching top 5 listings:', error);
    }
  }


  async create({ input, userId }) {
    console.log('Creating new listing with:', input);
    let transaction;
    let newListing;
    let mockUserId = userId || '66dc30358791fb6291ca94d1'
    console.log('Creating new listing with:', mockUserId);
    try {

      validateListing(input)
      // Perform additional validation based on the schema or requirements
      if (input.costPerNight < 0) {
        throw new Error("Price per night must be a positive number.");
      }
      if (input.costPerNight > 1000) {
        throw new Error("Price per night must not exceed $1000.");
      }

      if (!input.location || typeof input.location !== 'object') {
        console.error('Invalid or missing location:', input.location);
        throw new Error('Location is required and must be an object');
      }
      if (!input.pictures) {
        throw new Error("Missing required fields.");
      }
      // Input validation  
      if (!input.title || typeof input.title !== 'string') {
        console.error('Invalid or missing title:', input.title);
        throw new Error('Title is required and must be a string');
      }

      if (!Array.isArray(input.amenityIds) || input.amenityIds.length === 0) {
        console.error('At least one amenity ID is required, received:', input.amenityIds);
        throw new Error('At least one amenity ID is required');
      }

      if (!input.description || typeof input.description !== 'string') {
        console.error('Invalid or missing description:', input.description);
        throw new Error('Description is required and must be a string');
      }

      if (!mockUserId) {
        console.error('Host ID is required:', mockUserId);
        throw new Error('Host ID is required');
      }

      if (typeof input.numOfBeds !== 'number' || input.numOfBeds <= 0 || !Number.isInteger(input.numOfBeds)) {
        console.error('Number of beds must be a positive integer:', input.numOfBeds);
        throw new Error('Number of beds must be a positive integer');
      }
      console.log("Input data validated successfully:", JSON.stringify(input, null, 2));

      // Start a database transaction
      console.log("Starting transaction...");

      // Start a database transaction  
      transaction = await this.sequelize.transaction();
      const { amenityIds, location, ...listingData } = input;

      //step 1: create listing first
      newListing = await Listing.create({
        ...listingData,
        hostId: mockUserId,

      }, { transaction });
      console.log("Listing created with ID:", newListing.id);

      // Step 2: create location if provided, else use default location
      let locationId;
      if (location) {
        const locationData = {
          listingId: newListing.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
          zipCode: location.zipCode,
        };
        if (!location) {
          console.log("No location data provided.");
        } else {
          const createdLocation = await Location.create(locationData, { transaction });
          locationId = createdLocation.id;
          console.log("Location created with ID:", locationId);
        }
      }

      console.log('Created locationId:', locationId);
      console.log('Creating listing with data:', listingData);


      const amenityAssociations = amenityIds.map(amenityId => ({
        listingId: newListing.id,
        amenityId: amenityId.id,
      }));
      console.log('newListing.id:', newListing.id)
      await ListingAmenities.bulkCreate(amenityAssociations, { transaction });
      console.log('Amenity associations created for listing:', newListing.id);

      await transaction.commit();  // Commit the transaction  
      return newListing;

    } catch (error) {
      console.error('Error creating listing:', error);
      // if (transaction) await transaction.rollback();  // Rollback on error  
      throw new GraphQLError('Error creating listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }


  async getLocations() {
    try {
      const query = `SELECT * FROM locations`
      const locations = await this.sequelize.query(query, { type: QueryTypes.SELECT });
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new GraphQLError('Error fetching locations', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async numberOfUpcomingBookings(listingId) {
    try {
      const query = `SELECT COUNT(*) as count FROM bookings WHERE listingId = ? AND startDate > CURDATE()`;
      const response = await this.sequelize.query(query, { replacements: [listingId], type: QueryTypes.SELECT });
      return response[0].count;
    } catch (error) {
      console.error('Error fetching number of upcoming bookings:', error);
      throw new GraphQLError('Error fetching number of upcoming bookings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }
  async getBookingsByListing(listingId) {
    try {
      const query = `
        SELECT * FROM bookings WHERE listingId = ?
      `;
      const bookings = await this.sequelize.query(query, { replacements: [listingId], type: QueryTypes.SELECT });
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings by listing:', error);
      throw new GraphQLError('Error fetching bookings by listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getLocationById(listingId) {
    try {
      const query = `SELECT * FROM locations WHERE listingId = ?`; // Query using listingId
      console.log('Listing ID:', listingId); // Log listingId for debugging

      const response = await this.sequelize.query(query, {
        replacements: [listingId],  // Correct replacement for listingId
        type: QueryTypes.SELECT
      });

      if (response.length === 0) {
        console.log(`Location not found for listing ID: ${listingId}`);
        return null;  // Return null if no location is found
      }

      console.log('Query result:', response);
      return response[0];  // Return the first location found
    } catch (error) {
      console.error('Error creating listing:', error);
      if (transaction) await transaction.rollback();  // Rollback on error  
      throw new GraphQLError('Error creating listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async updateListing({ listingId, listing }) {
    try {
      // Prepare the fields to be updated and ensure no undefined values are included  
      const fieldsToUpdate = [];
      const replacements = { listingId }; // Start with listingId in replacements  

      if (listing.title !== undefined) {
        fieldsToUpdate.push('title = :title');
        replacements.title = listing.title;
      }
      if (listing.description !== undefined) {
        fieldsToUpdate.push('description = :description');
        replacements.description = listing.description;
      }
      if (listing.costPerNight !== undefined) {
        fieldsToUpdate.push('costPerNight = :costPerNight');
        replacements.costPerNight = listing.costPerNight;
      }
      if (listing.locationId !== undefined) {
        fieldsToUpdate.push('locationId = :locationId');
        replacements.locationId = listing.locationId;
      }
      if (listing.numOfBeds !== undefined) {
        fieldsToUpdate.push('numOfBeds = :numOfBeds');
        replacements.numOfBeds = listing.numOfBeds;
      }
      if (listing.pictures !== undefined) {
        fieldsToUpdate.push('pictures = :pictures');
        replacements.pictures = listing.pictures;
      }
      if (listing.isFeatured !== undefined) {
        fieldsToUpdate.push('isFeatured = :isFeatured');
        replacements.isFeatured = listing.isFeatured;
      }
      if (listing.saleAmount !== undefined) {
        fieldsToUpdate.push('saleAmount = :saleAmount');
        replacements.saleAmount = listing.saleAmount;
      }
      if (listing.bookingNumber !== undefined) {
        fieldsToUpdate.push('bookingNumber = :bookingNumber');
        replacements.bookingNumber = listing.bookingNumber;
      }
      if (listing.createdAt !== undefined) {
        fieldsToUpdate.push('createdAt = :createdAt');
        replacements.createdAt = listing.createdAt;
      }
      if (listing.updatedAt !== undefined) {
        fieldsToUpdate.push('updatedAt = :updatedAt');
        replacements.updatedAt = listing.updatedAt;
      }
      if (listing.checkInDate !== undefined) {
        fieldsToUpdate.push('checkInDate = :checkInDate');
        replacements.checkInDate = listing.checkInDate;
      }
      if (listing.checkOutDate !== undefined) {
        fieldsToUpdate.push('checkOutDate = :checkOutDate');
        replacements.checkOutDate = listing.checkOutDate;
      }
      if (listing.listingStatus !== undefined) {
        fieldsToUpdate.push('listingStatus = :listingStatus');
        replacements.listingStatus = listing.listingStatus;
      }

      if (fieldsToUpdate.length === 0) {
        throw new Error('No fields provided for update');
      }

      const query = `  
        UPDATE listings  
        SET ${fieldsToUpdate.join(', ')}  
        WHERE id = :listingId  
      `;

      console.log("Executing query:", query);
      console.log("With replacements:", replacements);

      const [results, metadata] = await this.sequelize.query(query, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      console.log("Results from query execution:", results);
      console.log("Metadata from query execution:", metadata);

      const affectedRows = metadata?.rowCount || results; // rowCount for PostgreSQL, results for MySQL  
      console.log('Update query affected rows:', affectedRows);

      // Return true if one or more rows were updated  
      return affectedRows > 0;
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
  async getCurrentlyBookedDateRangesForListing(listingId) {
    try {
      const query = `
        SELECT * FROM bookings WHERE listingId = :listingId
      `;
      const bookings = await this.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { listingId },
      });
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  async getListings(whereClause) {
    try {
      const query = `
        SELECT * FROM listings ${whereClause}
      `;
      const listings = await this.sequelize.query(query, { type: QueryTypes.SELECT });
      return listings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new Error('Failed to fetch listings');
    }
  }
}

export default ListingService;