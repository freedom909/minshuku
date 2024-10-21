import { AuthenticationError, ForbiddenError } from '../infrastructure/utils/errors.js';
import { permissions } from '../infrastructure/auth/permission.js';
import Listing from '../infrastructure/models/listing.js';
import Coordinate from '../infrastructure/models/location.js';
import dbConfig from '../infrastructure/DB/dbconfig.js';
import Location from '../infrastructure/models/location.js';
import { GraphQLError } from 'graphql';
import Amenity from '../infrastructure/models/amenity.js';
import { Op } from '@sequelize/core'
import fetch from 'axios';
import sequelize from '../infrastructure/models/seq.js';
import { v4 as uuidv4 } from 'uuid';
const { listingWithPermissions, isHostOfListing, isAdmin } = permissions;
import haversine from 'haversine-distance';
import { calculateDistance, haversineDistance } from './helper.js';

const resolvers = {

  Query: {

    location: async (listing, _, { dataSources }) => {
      try {
        if (!listing.locationId) {
          console.log('Location not found`', listing.locationId);
          return null;
        }
        return dataSources.listingService.getLocationById(listing.location)
      } catch {
        console.error('Error resolving location:', error);
        throw new Error('Failed to resolve location');
      }
    },

    getNearbyListings: async (_, { latitude, longitude, radius }, { dataSources }) => {
      if (!latitude || !longitude) throw new Error('You must provide a latitude and longitude');
      const { listingService } = dataSources;

      try {
        const response = await listingService.findNearbyListings({ longitude, latitude, radius });

        // Directly use response if it's already the listings  
        const listings = response.listings || response // Adjust as necessary  

        console.log("Full Listings Data:", JSON.stringify(listings, null, 2));

        // Filter and process listings based on distance  
        const nearbyListings = listings.map(listing => {
          if (!listing || !listing.location) {
            console.warn(`Listing ${listing ? listing.id : 'unknown'} is missing a location`);
            return null; // Skip this listing  
          }
          const { latitude: listingLatitude, longitude: listingLongitude } = listing.location;
          if (typeof listingLatitude !== 'number' || typeof listingLongitude !== 'number') {
            console.warn(`Listing ${listing.id} has invalid location coordinates: `, listing.location);
            return null; // Skip this listing  
          }
          const distance = haversineDistance(
            latitude, longitude,
            listingLatitude, listingLongitude
          );

          if (isNaN(distance)) {
            console.error(`Invalid distance calculated for listing ${listing.id}. Skipping.`);
            return null;
          }

          // Return listing only if it's within the radius  
          return distance <= radius ? {
            id: listing.id,
            title: listing.title,
            costPerNight: listing.costPerNight,
            numOfBeds: listing.numOfBeds,
            locationType: listing.locationType,
            pictures: listing.pictures,
            distance,  // Attach calculated distance  
          } : null;
        })
          .filter(listing => listing !== null);

        // console.log(`nearbyListing:`, JSON.stringify(nearbyListings, null, 2)); 
        return nearbyListings;
      } catch (error) {
        console.error('Error fetching nearby listings:', error);
        throw new Error('Failed to fetch nearby listings');
      }
    },

    fullTextSearchListings: async (_, { input }, { dataSources }) => {
      const { searchText, limit = 10, offset = 0 } = input;
      const { listingService } = dataSources;
      // Search in the `description` field using LIKE or other full-text search methods
      const listings = await Listing.findAll({
        where: {
          description: {
            [Op.like]: `%${searchText}%`,  // For full-text search in MySQL/PostgreSQL with LIKE
            //[Op.match]: sequelize.fn('to_tsquery', searchText),  // For PostgreSQL full-text search with tsvector
          }
        },
        limit,
        offset,
      });
      const totalCount = await Listing.count({
        where: {
          description: {
            [Op.like]: `%${searchText}%`,  // Use the same condition for counting results
          }
        }
      });

      return {
        listings,
        totalCount
      };
    },

    // location: async (parent, _, { dataSources }) => {
    //   const { locationService } = dataSources;
    //   //   Fetch the location using the locationId from the parent (Listing)
    //   try {
    //     const locationId = parent.locationId;
    //     if (!locationId) {
    //       return null;
    //     }
    //     // Assuming you have a locationService to fetch the location
    //     const location = await dataSources.locationService.getLocationById(locationId);
    //     return location;
    //   } catch (error) {
    //     console.error('Error resolving location:', error);
    //     throw new Error('Failed to resolve location');
    //   }
    // },

    hotListingsByMoney: async (_, __, { dataSources }) => {

      const { listingService } = dataSources;
      try {
        const listings = await listingService.hotListingsByMoneyBookingTop5();
        return listings;
      } catch (error) {
        throw new Error('Failed to fetch hot listings by money');
      }
    },

    hotListingsByBookingNumber: async (_, __, { dataSources }) => {
      const { listingService } = dataSources
      try {
        return listingService.hotListingsByNumberBookingTop5();
      } catch (error) {
        throw new Error('Failed to fetch hot listings by booking number');
      }
    },

    listings: async (_, args, { dataSources }) => {
      try {
        const listings = await Listing.findAll({
          include: [
            {
              model: Amenity,
              as: 'amenities', // This alias must match the association
              through: { attributes: [] },
              attributes: ['name', 'category'],
            },
            {
              model: Location,
              as: 'location', // This alias must match the association
              attributes: ['state', 'address', 'city', 'country', 'zipCode', 'latitude', 'longitude', 'name', 'radius'],
            }
          ],
        });
        console.log(JSON.stringify(listings, null, 2));  // Log the data for debugging
        if (!listings) {
          throw new Error('No listings found');
        }

        return listings.map(listing => ({
          ...listing.toJSON(),
          checkInDate: new Date(listing.checkInDate).toISOString(),
          checkOutDate: new Date(listing.checkOutDate).toISOString(),
        }));
      } catch (error) {
        console.error('Error fetching listings:', error);
        throw new Error('Failed to fetch listings');
      }
    },
    //"Return the listings that belong to the currently logged-in host"
    hostListings: async (_, { hostId }, { dataSources }) => {
      if (!hostId) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }
      try {
        const listings = await Listing.findAll({
          where: { hostId },
          include: [
            {
              model: Amenity,
              as: 'amenities', // This alias must match the association
              through: { attributes: [] },
              attributes: ['name', 'category'],
            },
            {
              model: Location,
              as: 'location', // This alias must match the association
              attributes: ['state', 'address', 'city', 'country', 'zipCode', 'latitude', 'longitude', 'name', 'radius'],
            }
          ],
        });
      } catch (error) {
        console.error('Error fetching listings:', error);
        throw new Error('Failed to fetch listings');
      }
    },
    listing: async (_, { id }, { dataSources }) => {
      try {
        const listing = await Listing.findOne({
          where: { id },
          include: [
            {
              model: Amenity,
              as: 'amenities', // This alias must match the association
              through: { attributes: [] },
              attributes: ['name', 'category'],
            },
            {
              model: Location,
              as: 'location', // This alias must match the association
              attributes: ['state', 'address', 'city', 'country', 'zipCode', 'latitude', 'longitude', 'name', 'radius'],
            }
          ],
        });
        console.log(JSON.stringify(listing.toJSON(), null, 2));  // Log the data for debugging
        if (!listing) {
          throw new Error('Listing not found');
        }
        return {
          ...listing.toJSON(),
          checkInDate: new Date(listing.checkInDate).toISOString(),
          checkOutDate: new Date(listing.checkOutDate).toISOString(),
        };
      } catch (error) {
        console.error('Error fetching listing:', error);
        throw new GraphQLError('Error fetching listing', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    filterlistings: async (_, { filter }, { dataSources }) => {
      const whereClause = {}
      if (filter?.minCostPerNight) {
        whereClause.costPerNight = { [Op.gte]: filter.minCostPerNight }
      }
      if (filter?.maxCostPerNight) {
        whereClause.costPerNight = { ...whereClause.costPerNight, [Op.lte]: filter.maxCostPerNight }
      }
      if (filter?.minGuests) {
        whereClause.numOfGuests = { [Op.gte]: filter.minGuests }
      }
      if (filter?.maxGuests) {
        whereClause.numOfGuests = { ...whereClause.numOfGuests, [Op.lte]: filter.maxGuests }
      }
      if (filter?.city) {
        whereClause[`$Location.city$`] = filter.city
      }
      //fetch listings with the specified filters
      let allListings = await dataSources.listingService.getListings(whereClause)
      //fetch listings with the specified filters by distance
      if (filter?.latitude && filter?.longitude && filter?.distance) {
        allListings = allListings.filter((listing) => {
          if (listing.location?.latitude && listing.location?.longitude) {
            const distance = haversineDistance(
              {
                latitude: parseFloat(filter.latitude),
                longitude: parseFloat(filter.longitude),
              },
              {
                latitude: parseFloat(listing.location.latitude),
                longitude: parseFloat(listing.location.longitude),
              }
            )
            return distance <= filter.distance;
          }
          return false;
        })
      }
      return allListings;
    },

    featuredListings: async () => {
      // Fetch featured listings with coordinates
      return await Listing.findAll({
        where: { isFeatured: true }, // Filter for featured listings
        attributes: ['id', 'locationType', 'title', 'checkInDate', 'checkOutDate', 'pictures', 'description', 'costPerNight', 'saleAmount'], // Include id, locationType, title
        include: [
          {
            model: Amenity,
            as: 'amenities',
            through: { attributes: [] },
            attributes: ['name', 'category'],
          },
          {
            model: Location,
            as: 'location', // Ensure alias matches the association
            attributes: ['state', 'address', 'city', 'country', 'zipCode', 'latitude', 'longitude', 'name', 'radius'],
          }
        ],
      });
    },

    hotListings: async (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getTop5Listings();
    },

    listingAmenities: (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getAllAmenities();
    },

    amenities: async (listing, _, { dataSources }) => {
      const { listingService } = dataSources;
      const amenities = await listingService.getAmenitiesForListing(listing.id);
      console.log(`Amenities for listing ${listing.id}:`, amenities);  // Debug log
      return amenities;
    },



    searchListingOfBooking: async (_, { criteria }, { dataSources }) => {
      try {
        const { listingService, bookingService } = dataSources;
        const { numOfBeds, reservedDate, page, limit, sortBy } = criteria;
        const { checkInDate, checkOutDate } = reservedDate;
        const listings = await listingService.searchListingOfBooking({
          numOfBeds,
          checkInDate,
          checkOutDate,
          page,
          limit,
          sortBy
        });
        const listingAvailability = await Promise.all(
          listings.map(listing =>
            bookingService.isListingAvailable({ listingId: listing.id, checkInDate, checkOutDate })
          )
        );
        return listings.filter((listing, index) => listingAvailability[index]);
      } catch (error) {
        console.error('Error searching listings:', error);
        throw new Error('Failed to search listings');
      }
    }
  },
  Mutation: {
    deleteListing: async (_, { input }, { dataSources, userId }) => {
      // if (!userId) throw new AuthenticationError('User not authenticated');
      // if (!isHostOfListing || !isAdmin) {
      //   throw new AuthenticationError(`you don't have right to delete this list`)
      // }
      const { listingId } = input; // Destructure listingId from input
      if (!listingId) throw new Error('Listing ID not provided');
      console.log('Attempting to delete listing with ID:', listingId); // Log the listing ID
      try {
        await dataSources.listingService.deleteListing(listingId);
        return {
          code: 200,
          success: true,
          message: 'Listing successfully deleted',
          listing: null // Or return listing details if needed
        };
      } catch (error) {
        console.error('Error deleting listing:', error);
        return {
          code: 500,
          success: false,
          message: error.message,
          listing: null
        };
      }
    },

    updateListingStatus: async (_, { input }, { dataSources }) => {
      // if (!userId) throw new AuthenticationError('User not authenticated');
      // if (!listingWithPermissions) {
      //   throw new AuthenticationError('User does not have permissions to create a listing');
      // }
      const { id, listingStatus } = input;
      console.log('Input received:', input);

      try {
        const listing = await Listing.findByPk(id);
        console.log('Listing', listing);

        if (!listing) {
          return {
            success: false,  // Return false if the listing is not found
            listingStatus: null,
            code: '404',
            message: 'Listing not found',
          };
        }

        listing.listingStatus = listingStatus;
        await listing.save();

        return {
          success: true,  // Return true if the update was successful
          listingStatus: listing.listingStatus,
          code: '200',
          message: 'Listing status updated successfully',
        };
      } catch (error) {
        console.error('Error updating listing status:', error);
        return {
          success: false,  // Return false if there was an error
          listingStatus: null,
          code: '500',
          message: 'Error updating listing status',
        };
      }
    },

    async createListing(_, { input }, { dataSources, userId }) {
      try {
        // Uncomment authentication checks if required
        // if (!userId) throw new AuthenticationError('User not authenticated');
        // if (!isHostOfListing || !isAdmin) {
        //   throw new AuthenticationError(`you don't have the right to update this list`);
        // }

        const { location, ...listingInput } = input;
        let locationId = location.locationId;

        const { listingService, locationService } = dataSources; // Destructure services

        if (!locationId) {
          // If locationId is not provided, create a new location
          const newLocation = await locationService.createLocation({ location });
          locationId = newLocation.id; // Get the new location's id
        }

        // Prepare listing data with locationId
        const listingData = { ...listingInput, locationId, userId }; // Include userId in listingData

        // Create the listing with the updated data
        const newListing = await listingService.createListing({ input: listingData });

        return {
          listing: newListing,
          success: !!newListing,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    updateListing: async (_, { listingId, listing }, { dataSources, userId }) => {
      // if (!userId) throw new AuthenticationError('User not authenticated');
      // if (!isHostOfListing || !isAdmin) {
      //   throw new AuthenticationError(`you don't have right to update this list`)
      // }
      const { listingService } = dataSources;
      console.log('Updating listing with id:', listingId, 'and data:', listing);
      if (!listingId) throw new Error('Listing ID not provided');
      try {
        const updatedListing = await listingService.updateListing({ listingId, listing });
        console.log('Updated listing:', updatedListing);
        return {
          code: 200, // Example success code
          success: true,
          message: 'Listing updated successfully.',
          listing: updatedListing // Return the updated listing object
        };
      } catch (error) {
        console.error(error);
        return {
          code: 500,
          success: false,
          message: error.message
        };
      }
    },
  },

  Listing: {
    __resolveReference: async (reference, { dataSources }) => {
      try {
        const listing = await Listing.findOne({
          where: { id: reference.id },
          include: [
            {
              model: Amenity,
              as: 'amenities',
              through: { attributes: [] },
              attributes: ['name', 'category'],
            },
            {
              model: Location,
              as: 'location',
              attributes: ['state', 'address', 'city', 'country', 'zipCode', 'latitude', 'longitude', 'name', 'radius'],
            }
          ]
        })
        if (!listing) {
          throw new Error('Listing not found');
        }
        return {
          ...listing.toJSON(),
          checkInDate: new Date(listing.checkInDate).toISOString(),
          checkOutDate: new Date(listing.checkOutDate).toISOString(),
        };
      } catch (error) {
        console.error('Error resolving listing reference:', error);
        throw new Error('Failed to resolve listing reference');
      }
    },


    amenities: ({ amenities }) => {
      return amenities.map(amenity => ({ id: amenity.id, name: amenity.name, category: amenity.category }));
    },
    // Resolves hostId if the user is a 'host' or 'ADMIN'
    hostId: ({ user }) => {
      if (user && (user.role === 'host' || user.role === 'ADMIN')) {
        return { id: user.id };
      }
      return null;
    },

    // Directly resolve 'isFeatured' field if it's available in the Listing object
    isFeatured: (listing) => {
      return listing.isFeatured; // returns 1 or 0 depending on the listing data
    },

    // Resolve 'saleAmount' field, assuming it's a number in the listing
    saleAmount: (listing) => {
      return listing.saleAmount || 0; // Return 0 if no sale amount is set
    },

    // Resolve 'locationType' field if it's available in the listing
    locationType: (listing) => {
      return listing.locationType; // e.g., 'CAMPSITE', 'VILLA', 'APARTMENT'
    },

    // Resolve 'bookingNumber' field, assuming it represents the total number of bookings
    bookingNumber: (listing) => {
      return listing.bookingNumber || 0; // Return 0 if no bookings
    },

    // Resolve 'locationId' field if it's available in the listing
    locationId: (listing) => {
      return listing.locationId; // The foreign key reference to the location
    },

    pictures: (listing) => {
      return listing.pictures.map(url => ({ url }));
    },
    totalCost: async (parent, { checkInDate, checkOutDate }, { dataSources }) => {
      const { listingService } = dataSources;
      const { id } = parent;

      try {
        // Fetch the listing by its ID
        const listing = await Listing.findOne({ where: { id } });
        console.log(listing.totalCost); // Outputs the calculated total cost
        if (!listing) {
          console.log(`No listing found with ID: ${id}`);
          return null;
        }
        if (typeof listing.costPerNight !== 'number') {
          console.log('Invalid or missing costPerNight:', listing.costPerNight);
          return null;
        }

        // Parse dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Check if dates are valid
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          console.log('Invalid dates provided.');
          return null;
        }

        // Calculate the number of nights
        const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate the total cost
        const totalCost = listing.costPerNight * numberOfNights;

        return totalCost;
      } catch (error) {
        console.error('Error in totalCost resolver:', error);
        return null;
      }
    },


    locationFilter: async (listing, args, { dataSources }) => {
      // Assuming you have a dataSource method to fetch the location details
      const { city } = listing;

      try {
        // Fetch the location from the database based on the city or other location details
        const location = await dataSources.locationService.getLocationByCity(city);

        if (!location) {
          throw new Error(`Location for city "${city}" not found`);
        }

        return {
          id: location.id,
          name: location.name,
          country: location.country,
          postalCode: location.postalCode,
          city: location.city,
          state: location.state,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          radius: location.radius,
        };
      } catch (error) {
        console.error('Error fetching location:', error);
        throw new Error('Unable to fetch location');
      }
    },

    __resolveType(listing) {
      if (listing.apartment) {
        return 'ApartmentListing';
      } else if (listing.house) {
        return 'HouseListing';
      }
      return 'OtherListingType';
    },

    amenities: async ({ id }, _, { dataSources }) => {
      const { listingService } = dataSources;
      try {
        const listing = await listingService.getListing(id);
        if (!listing) throw new Error('Listing not found');
        const amenities = listing.amenities || [];
        console.log('Amenities:', amenities);
        return amenities.map(amenity => ({
          id: amenity.dataValues.id,
          category: amenity.dataValues.category.replace(' ', '_').toUpperCase(),
          name: amenity.dataValues.name.replace(' ', '_').toUpperCase(),
        }));
      } catch (error) {
        console.error(`Error fetching amenities for listing ${id}:`, error);
        throw new Error('Failed to fetch amenities');
      }
    },
    currentlyBookedDates: ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      return bookingService.getCurrentlyBookedDateRangesForListing(id);
    },
    bookings: async ({ id }, _, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError('User not authenticated');
      if (!listingWithPermissions) {
        throw new ForbiddenError('User does not have permissions to search the listings');
      }
      try {
        const { listingService, bookingService } = dataSources;
        const { numOfBeds, reservedDate, page, limit, sortBy } = criteria;
        const { checkInDate, checkOutDate } = reservedDate;
        const listings = await listingService.searchListingOfBooking({
          numOfBeds,
          checkInDate,
          checkOutDate,
          page,
          limit,
          sortBy
        });
        const listingAvailability = await Promise.all(
          listings.map(listing =>
            bookingService.isListingAvailable({ listingId: listing.id, checkInDate, checkOutDate })
          )
        );
        return listings.filter((listing, index) => listingAvailability[index]);
      } catch (error) {
        console.error('Error searching listings:', error);
        throw new Error('Failed to search listings');
      }
    },

    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      const bookings = await bookingService.getBookingsForListing(id, 'UPCOMING') || [];
      return bookings.length;
    },

    getListingWithLocation: async (_, { latitude, longitude, locationId }, { dataSources }) => {
      if (latitude !== undefined && longitude !== undefined) {
        throw new Error(`you must provide a latitude and longitude`)
      }
      const { listingService } = dataSources;
      try {
        // Fetch the listing by locationId
        const listing = await listingService.getListingByLocation(locationId);
        if (!listing) throw new Error('Listing not found');
        // Calculate the radius/distance between the guest's location and the room
        const distance = calculateDistance(latitude, longitude, listing.latitude, listing.longitude);

        // Return the listing data along with the distance
        return {
          ...listing,
          distance // Return distance in kilometers (or your preferred unit)
        };
      } catch (error) {
        console.error('Error fetching listing:', error);
        throw new Error('Failed to fetch listing');
      }
    },


    coordinates: async (parent, _, { dataSources }) => {
      // Use eager loading to fetch coordinates when fetching listings
      const listingWithCoordinates = await Listing.findOne({
        where: { id: parent.id },
        include: [{ model: Coordinate, as: 'coordinate' }],
      });

      // Return the associated coordinates
      return listingWithCoordinates?.coordinates || null;
    },
  },

  AmenityCategory: {
    ACCOMMODATION_DETAILS: 'ACCOMMODATION_DETAILS',
    SPACE_SURVIVAL: 'SPACE_SURVIVAL',
    OUTDOORS: 'OUTDOORS'
  }
}

export default resolvers;

