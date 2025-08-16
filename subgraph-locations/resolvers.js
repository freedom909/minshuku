
import { AuthenticationError } from '../infrastructure/utils/errors.js';
import Listing from '../services/models/mysql/listing.js';
import Location from '../services/models/mysql/location.js';

const resolvers = {
    Mutation: {
     createLocation: async (_, { input }, context) => {
      const locationService = context?.dataSources?.locationService;
      const isListingCreation = context?.isListingCreation;

      if (!locationService) {
        throw new Error('locationService missing in context');
      }
      if (!input) {
        throw new Error('Location input is required but was not provided');
      }
      // if (!isListingCreation) {
      //   throw new AuthenticationError(
      //     'Cannot create location without proper listing context'
      //   );
      // }

      // Validate required fields
      const requiredFields = [
        'name', 'latitude', 'longitude', 'address', 'city',
        'state', 'country', 'zip', 'radius', 'units'
      ];
      for (const field of requiredFields) {
        if (!input[field]) {
          throw new Error(`Location data must include ${field}`);
        }
      }

      try {
        let options = {};
        const newLocation = await locationService.createLocation(input,options);
        return {
          code: 200,
          success: true,
          message: 'Location created successfully',
          location: newLocation,
        };
      } catch (error) {
        console.error('Error creating location:', error);
        throw new Error('Failed to create location');
      }
    },

Location: {
    __resolveReference: async (ref, { dataSources }) => {
      return dataSources.locationService.getLocationById(ref.id);
    }
  },

        deleteLocation: (_, { id }, { dataSources, user }) => {
            // if (!userId) throw new AuthenticationError('User not authenticated');
            // if (!isHostOfListing || !isAdmin) {
            //   throw new AuthenticationError(`you don't have right to update this list`)
            // }
            // if (!id) {
            //     throw new Error('you must input a location ID ');
            // }
            try {
                return dataSources.locationService.deleteLocation(id);
            } catch (error) {
                console.error('Error in deleteLocation resolver:', error);
            }
        },
        // updateLocation: (_, { id, input }, { dataSources }) => {
        updateLocation: (_, { input }, { dataSources }) => {
            return dataSources.locationService.updateLocation(input);
        },
    },
    Query: {
    locations: async (_, { locationId }, { dataSources }) => {
      const service = dataSources.locationService;
      if (locationId) {
        return [await service.getById(locationId)];
      }
      return service.getAll();
    },
  },
  Location: {
    id: (loc) => loc.id,
    name: (loc) => loc.name,
    address: (loc) => loc.address,
    city: (loc) => loc.city,
    state: (loc) => loc.state,
    zip: (loc) => loc.zip,
    country: (loc) => loc.country,
    latitude: (loc) => loc.latitude,
    longitude: (loc) => loc.longitude,
  },
}

export default resolvers;