

// import Listing from '../infrastructure/models/listing.js';
// import Coordinate from '../infrastructure/models/location.js';
// import dbConfig from '../infrastructure/DB/dbconfig.js';
// import Location from '../infrastructure/';
// import { FLOAT } from 'sequelize';

const resolvers = {
    Mutation: {
        createLocation: async (_, { input }, { dataSources, user }) => {
            // if (user.role !== 'ADMIN' || user.role !== 'host') {
            //     throw new AuthenticationError('You must be an admin or a host to create a location.');
            // }
            // const { location } = input
            try {
                const result = await dataSources.locationService.createLocation(input);

                // Check if the location is returned correctly from the service
                if (!result.success || !result.data || !result.data.location) {
                    throw new Error('Failed to create location');
                }

                return {
                    success: result.success,
                    location: result.data.location  // This must not be null
                };
            } catch (error) {
                console.error('Error in createLocation resolver:', error);
                return {
                    success: false,
                    location: null
                };
            }
        },
        updateLocation: (_, { input }, { dataSources }) => {
            return dataSources.locationService.updateLocation(input);
        },
    },
    Query: {
        locations: (_, __, { dataSources }) => {
            return dataSources.locationService.getAllLocations();
        },
        location: (_, { id }, { dataSources }) => {
            return dataSources.locationService.getLocationById(id);
        },
        listings: {

        },

    }
}

export default resolvers;