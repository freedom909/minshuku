// initializeAmenityContainer.js
import { createContainer, asValue, asClass } from 'awilix';
import ListingService from '../listingService.js';
import ListingRepository from '../repositories/listingRepository.js';
import LocalAuthService from '../userService/localAuthService.js';
import OAuthService from '../userService/oauthService.js';
import TokenService from '../userService/tokenService.js';
import UserRepository from '../repositories/userRepository.js';
import AmenityService from '../amenityService.js';
import ReviewService from '../reviewService.js';
import ReviewRepository from '../repositories/reviewRepository.js';
import BookingService from '../bookingService.js';
import BookingRepository from '../repositories/bookingRepository.js';
import connectMysql from './connectMysqlDB.js';
import connectToMongoDB from './connectMongoDB.js';
import connect from './connectNeo4jDB.js'; // Import your Neo4j database connection function
import sequelize from '../models/config/seq.js'
import axios from 'axios';
import LocationRepository from '../repositories/locationRepository.js';

const initializeReviewContainer = async () => {
  try {
    // Connect to databases
    const mysql = await connectMysql();
    const mongodb = await connectToMongoDB();
    const neo4jdb = await connect().catch(error => {
      console.error('Failed to connect to Neo4j:', error);
      throw error;
    });

    const container = createContainer();
    if (!container) {
      throw new Error("Failed to create container.");
    }

    console.log('Container created successfully');
    
  
    container.register({
      mysql: asValue(mysql),
      mongodb: asValue(mongodb),
      neo4jdb: asValue(neo4jdb),
      sequelize: asValue(sequelize),
      userRepository: asClass(UserRepository).singleton(),
      listingRepository: asClass(ListingRepository).singleton(),
      locationRepository: asClass(LocationRepository).singleton(),
      bookingRepository: asClass(BookingRepository).singleton(),
      reviewRepository: asClass(ReviewRepository).singleton(),
      reviewService: asClass(ReviewService)
      .inject(() => ({
        reviewRepository: container.resolve('reviewRepository')
      }))
      .singleton(),
      listingService: asClass(ListingService).singleton(),
      bookingService: asClass(BookingService).singleton(),
      localAuthService: asClass(LocalAuthService).singleton(),
      oAuthService: asClass(OAuthService).singleton(),
      tokenService: asClass(TokenService).singleton(),
    
      secretKey: asValue(process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string'),
      expiresIn: asValue('1h'),
      axios: asValue(axios),
    });
    // Verify critical services are registered
    const requiredServices = [
      'reviewRepository',
      'reviewService',
      'neo4jdb'
    ];

    for (const service of requiredServices) {
      if (!container.hasRegistration(service)) {
        throw new Error(`Failed to register required service: ${service}`);
      }
    }

    console.log('All required services registered successfully');
    console.log('Container registrations:', Object.keys(container.registrations));
    console.log('Container services:', Object.keys(container.cradle));
    
    return container;
  } catch (error) {
    console.error('Error initializing container:', error);
    throw error;
  }
};

export default initializeReviewContainer;
