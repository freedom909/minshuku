

import Listing from '../infrastructure/models/listing.js';
import Coordinate from '../infrastructure/models/location.js';
import dbConfig from '../infrastructure/DB/dbconfig.js';
import Location from '../infrastructure/models/location.js';
import { FLOAT } from 'sequelize';

const resolvers = {
    Mutation: {
        createLocation: (_, { input }, { dataSources }) => {
            return dataSources.locationService.createLocation(input);
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