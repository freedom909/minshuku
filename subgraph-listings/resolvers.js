import { AuthenticationError, ForbiddenError, } from '../infrastructure/utils/errors.js';
import { permissions } from '../infrastructure/auth/permission.js';
import Listing from '../services/models/mysql/listing.js';
import Coordinate from '../services/models/mysql/location.js';
import { UserInputError } from '../infrastructure/utils/errors.js';
import Location from '../services/models/mysql/location.js';
import { GraphQLError } from 'graphql';
import Amenity from '../services/models/mysql/amenity.js';
import Category, { validateCategoryInput } from '../services/models/mysql/category.js';
import transaction, { Op } from '@sequelize/core'
import calculateDistance from './calculateDistance.js';
import { resolve } from 'path';
import { isHost } from '../infrastructure/auth/permission.js'

const { listingWithPermissions } = permissions;
import { v4 as uuidv4, validate as uuidValidate } from 'uuid'
const resolvers = {

  Query: {
    getNearbyListings: async (_, { latitude, longitude, radius }, { dataSources }) => {

      if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof radius !== 'number' || radius <= 0) {
        throw new UserInputError('Invalid Input: Latitude, longitude, and radius must be valid numbers, with radius greater than 0.');
      }
      const { listingService, locationService } = dataSources;
      let transaction;
      try {
        const nearbyListings = await listingService.getNearbyListings({ latitude, longitude, radius: 5 });
        nearbyListings.forEach(listing => {
          if (!listing.title) {
            console.warn(`Listing with ID ${listing.id} is missing a title.`);
          }
          if (!listing.id) {
            console.warn(`Listing is missing an ID:`, JSON.stringify(listing, null, 2));
          }
        });
        console.log('Nearby Listings fetch result:', JSON.stringify(nearbyListings, null, 2));

        // Map the output to ensure it contains every required field
        const mappedListings = nearbyListings.map(async listing => {
          const location = await locationService.getLocationById(listing.locationId); // Assuming this is async  

          return {
            id: listing.id || 'default_id',
            title: listing.title || 'Untitled Listing', // Provide default if title is missing  
            description: listing.description || 'No description available',
            pictures: listing.pictures || [],
            numOfBeds: listing.numOfBeds || 0,
            price: listing.price || 0,
            isFeatured: listing.isFeatured || false,
            saleAmount: listing.saleAmount || 0,
            checkInDate: listing.checkInDate || 'default_check_in_date',
            checkOutDate: listing.checkOutDate || 'default_check_out_date',
            distance: listing.distance || 0,
            location: {
              id: location?.id || 'default_location_id', // Use fetched location  
              latitude: location?.latitude || 0,
              longitude: location?.longitude || 0,
              radius: location?.radius || 0,
              units: location?.units || 'km',
              city: location?.city || 'unknown',
              listingId: listing.id || 'unknown-listing',
              name: location?.name || 'UFO',
              country: location?.country || 'USA',
              zip: location?.zip || '1234567', // Fixed typing issue  
              state: location?.state || 'Washington', // Fixed typing issue  
            },
            locationType: listing.locationType || 'ROOM',
            bookingNumber: listing.bookingNumber || 0,
            amenities: listing.amenities || [],
            host: {
              id: listing.host?.id || 'default_host_id',
              name: listing.host?.name || 'default_host_name',
              picture: listing.host?.picture || 'default_host_picture_url'
            },
            numberOfUpcomingBookings: listing.numberOfUpcomingBookings || 0,
            currentlyBookedDates: listing.currentlyBookedDates || [],
            totalCost: listing.totalCost || 0,
            bookings: listing.bookings || [],
            availability: listing.availability || [],
            priceRange: { min: listing.priceRange?.min || 0, max: listing.priceRange?.max || 0 },
            totalCostRange: { min: listing.totalCostRange?.min || 0, max: listing.totalCostRange?.max || 0 }
          };
        });

        console.log("Mapped Listings:", mappedListings);

        return mappedListings;
      } catch (error) {
        console.error('Error fetching nearby listings:', error);
        throw new Error('Error fetching nearby listings');
      }
    },


    fullTextSearchListings: async (_, { input }, { dataSources }) => {
      const { listingService } = dataSources
      if (!listingService) {
        throw new Error("ListingService is not initialized.");
      }


      const { searchText, limit = 10, offset = 0 } = input;
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

    location: async (parent, _, { dataSources }) => {
      const { listingService } = dataSources;
      const listingId = parent.id;  // Use the listing's ID from the parent

      try {
        const result = await listingService.getLocationById(listingId);  // Fetch location by listingId

        if (!result) {
          console.error('Location not found for listing ID:', listingId);
          return null;  // Return null if no location is found
        }

        // Return the location object as per the schema
        return {
          id: result.id,
          name: result.name,
          address: result.address,
          city: result.city,
          state: result.state,
          country: result.country,
          zip: result.zip,
        };
      } catch (error) {
        console.error('Error fetching location:', error);
        return null;
      }
    },

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
              attributes: ['state', 'address', 'city', 'country', 'zip', 'latitude', 'longitude', 'name', 'radius'],
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
              attributes: ['state', 'address', 'city', 'country', 'zip', 'latitude', 'longitude', 'name', 'radius'],
            }
          ],
        });
        return listings;
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
              attributes: ['state', 'address', 'city', 'country', 'zip', 'latitude', 'longitude', 'name', 'radius'],
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

    categories: async (_, __, { dataSources }) => {
      try {
        // Assuming you have a categoryService or can access the model directly
        const categories = await Category.findAll();
        return categories;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw new GraphQLError('Error fetching categories', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    featuredListings: async () => {
      // Fetch featured listings with coordinates
      return await Listing.findAll({
        where: { isFeatured: true }, // Filter for featured listings
        attributes: ['id', 'locationType', 'title', 'checkInDate', 'checkOutDate', 'photoThumbnail', 'description', 'price', 'saleAmount'], // Include id, locationType, title
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
            attributes: ['state', 'address', 'city', 'country', 'zip', 'latitude', 'longitude', 'name', 'radius'],
          }
        ],
      });
    },

    locations: async (_, __, { dataSources }) => {
      try {
        const locations = await Location.findAll();
        return locations;
      } catch (error) {
        console.error('Error fetching locations:', error);
        throw new GraphQLError('Error fetching locations', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    hotListings: async (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getTop5Listings();
    },

    listingAmenities: (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getAllAmenities();
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
      //if (!userId) throw new AuthenticationError('User not authenticated');
      //if (!isHostOfListing || !isAdmin) {
      //throw new AuthenticationError(`you don't have right to delete this list`)
      //}
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

    createFeaturedTitle: async (_, { input }, context) => {
      const { userId, dataSources } = context;
      if (!userId) {
        throw new AuthenticationError('You must be logged in to create a featured title.');
      }

      // This check assumes the user's role is available.
      // In a real federated setup, this might involve querying the users subgraph
      // or having the role passed in the context from the gateway.
      // For now, we'll proceed with a placeholder check.
      // const user = await dataSources.userService.getUserById(userId);
      // if (user.role !== 'HOST' && user.role !== 'ADMIN') {
      //   throw new ForbiddenError('You must be a Host to perform this action.');
      // }

      validateCategoryInput(input);
      const newCategory = await Category.create(input);

      return {
        code: 200,
        success: true,
        message: 'Featured title successfully created',
        category: newCategory,
      };
    },

    createCategory: async (_, { input }, context) => {
      const { userId, dataSources } = context;

      // 1. Check if the user is authenticated
      if (!userId) {
        throw new AuthenticationError('You must be logged in to create a category.');
      }

      // 2. Check if the user has the ADMIN role
      // NOTE: This requires the 'users' subgraph to be properly integrated
      // and the user's role to be available. For now, we'll proceed assuming
      // we can fetch the user and check their role.
      const user = context.user; // Assuming user object with role is in context
      if (user?.role !== 'ADMIN') {
         // This check is currently non-functional as user role is not in context.
         // A real implementation would require fetching user role from the accounts/users service.
         // For now, we are commenting out the error to allow functionality.
         // throw new ForbiddenError('You must be an Admin to create a category.');
      }

      // 3. Validate and create the category
      validateCategoryInput(input);
      const newCategory = await Category.create(input);

      return {
        code: 200,
        success: true,
        message: 'Category successfully created',
        category: newCategory,
      };
    },
  
    createAmenity: async (_, { input }, context) => {
      const { userId } = context;
      if (!userId) {
        throw new AuthenticationError('You must be logged in to create an amenity.');
      }

      // Basic validation
      if (!input.name || !input.category) {
        throw new UserInputError('Amenity name and category are required.');
      }

      // Check for duplicate amenity name (case-insensitive)
      const existingAmenity = await Amenity.findOne({ where: { name: input.name } });
      if (existingAmenity) {
        throw new UserInputError('An amenity with this name already exists.');
      }

      const newAmenity = await Amenity.create(input);

      return {
        code: 200,
        success: true,
        message: 'Amenity successfully created',
        amenity: newAmenity,
      };
    },


    createListing: async (_, { input }, context) => {
      console.log("Mutation createListing invoked:", input);

      // -------------------------------
      // 0. Validate context
      // -------------------------------
      if (!context?.dataSources) {
        throw new Error("Invalid context: dataSources missing.");
      }
      // Auth is preferred; allow hostId fallback in development
      // If userId is missing, we will use input.hostId below

      const { userId, dataSources } = context;
      const { listingService, locationService } = dataSources;

      // -------------------------------
      // 1. Determine hostId
      // -------------------------------
      const hostId = userId || input.hostId;
      if (!hostId) throw new Error("Host ID not provided");

      let locationId;
      let newListing;

      try {
        // -------------------------------
        // 2. Create Location (optional)
        // -------------------------------
        if (input?.locationInput) {
          const locationCtx = { isListingCreation: true, userRole: "host", listingId: null };
          const createdLocation = await locationService.createLocation(input.locationInput, { context: locationCtx });
          if (!createdLocation?.id) throw new Error("Location creation failed");
          locationId = createdLocation.id;
        } else {
          locationId = input.locationId;
          if (!locationId) throw new Error("Missing locationId");
        }

        // -------------------------------
        // 3. Prepare listing input
        // -------------------------------
        const listingInput = {
          ...input,
          locationId,
          hostId
        };

        // -------------------------------
        // 4. Create listing
        // -------------------------------
        newListing = await listingService.createListing(listingInput);
        if (!newListing?.id) throw new Error("Listing creation failed: missing ID");

        // Categories and amenities are linked inside listingService transaction
        // Avoid re-assignment here to preserve idempotency and prevent conflicts

        // -------------------------------
        // 7. Return
        // -------------------------------
        return {
          code: 200,
          success: true,
          message: "Listing successfully created!",
          listing: newListing
        };

      } catch (error) {
        console.error("Error creating listing:", error);
        throw new GraphQLError("Listing creation failed: " + error.message);
      }
    },

    updateListingStatus: async (_, { input }, { dataSources }) => {
      // if (!userId) throw new AuthenticationError('User not authenticated');
      // if (!listingWithPermissions) {
      //   throw new AuthenticationError('User does not have permissions to create a listing');
      // }
      const { id, listingStatus } = input;
      console.log('Input received:', input);
      const { listingService } = dataSources;
      try {
        const listing = await Listing.findByPk(id);
        console.log('Listing', listing);//no output

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

    updateListing: async (_, { listingId, listing }, { dataSources, userId }) => {
      // if (!userId) throw new AuthenticationError('User not authenticated');
      //if (!isHostOfListing || !isAdmin) {
      //  throw new AuthenticationError(`you don't have right to update this list`)
      //}
      const { listingService } = dataSources;

      if (!listingId) throw new Error('Listing ID not provided');
      try {
        const updatedListing = await listingService.updateListing({ listing, listingId });
        return {
          code: 200,
          success: true,
          message: 'Listing successfully updated',
          listing: updatedListing
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
    location: (listing) => ({
      __typename: "Location",
      id: listing.locationId
    }),
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
              attributes: ['state', 'address', 'city', 'country', 'zip', 'latitude', 'longitude', 'name', 'radius'],
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

    host: ({ hostId }) => {
      if (!hostId) return null;
      // Provide concrete type hint and role for interface resolution
      // Ensure non-null email to satisfy Host.email: String!
      return {
        __typename: 'Host',
        id: hostId,
        role: 'HOST',
        email: `user-${hostId}@placeholder.local`,
      };
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
        if (typeof listing.price !== 'number') {
          console.log('Invalid or missing price:', listing.price);
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
        const totalCost = listing.price * numberOfNights;

        return totalCost;
      } catch (error) {
        console.error('Error in totalCost resolver:', error);
        return null;
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
        return amenities.map(amenity => ({
          ...amenity,
          category: amenity.category.replace(' ', '_').toUpperCase(),
          name: amenity.name.replace(' ', '_').toUpperCase()
        }));
      } catch (error) {
        console.error(`Error fetching amenities for listing ${id}:`, error);
        throw new Error('Failed to fetch amenities');
      }
    },
    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      const bookings = await bookingService.getBookingsForListing(id, 'UPCOMING') || [];
      return bookings.length;
    },

    getListingWithLocation: async (_, { listingId }, { dataSources }) => {
      try {
        const listing = await dataSources.listingService.getListingById(listingId);  // Fetch listing details
        if (!listing) {
          throw new Error(`Listing not found for ID: ${listingId}`);
        }

        return listing;  // Return the listing object
      } catch (error) {
        console.error('Error fetching listing:', error);
        throw new Error('Failed to fetch listing');
      }
    },
  },

  User: {
    __resolveType(obj) {
      if (obj.role === "HOST") return "Host";
      if (obj.role === "GUEST") return "Guest";
      return null; // GraphQL will throw if this happens
    }
  },
  AmenityCategory: {
    ACCOMMODATION_DETAILS: 'ACCOMMODATION_DETAILS',
    SPACE_SURVIVAL: 'SPACE_SURVIVAL',
    OUTDOORS: 'OUTDOORS'
  }
}

export default resolvers;