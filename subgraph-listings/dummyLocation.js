// resolvers.js  
import ListingService from '../infrastructure/services/listingService.js';
import ListingRepository from '../infrastructure/repositories/listingRepository.js'; // Path to your repository  
import sequelize from '../infrastructure/models/seq.js'; // Path to your sequelize instance  
import resolvers from './resolvers.js';

// Create instances of your dependencies  
const listingRepository = new ListingRepository(); // Or use an actual instance from ORM  
const sequelizeInstance = sequelize; // Import the actual sequelize instance  
// Simulated input parameters for the resolver  
const params = {
    latitude: 47.6062,      // Example latitude  
    longitude: -122.332,     // Example longitude  
    radius: 10               // Example radius in units (e.g., kilometers)  
};

// Mock data sources so that the resolver can access the listings data  
const dataSources = {
    listingsData: {
        getListings: async () => listings // Simulated function to return listings data  
    }
};

// Dummy listings data with locations  
const listings = [
    {
        "id": "listing-1",
        "title": "Cave campsite in snowy MoundiiX",
        "costPerNight": 120,
        "numOfBeds": 2,
        "locationType": "CAMPSITE",
        "location": {
            "latitude": 47.6062,
            "longitude": -122.332
        },
        "pictures": "https://res.cloudinary.com/apollographql/image/upload/v1644350721/odyssey/federation-course2/illustrations/listings-01.png"
    },
    {
        "id": "listing-10",
        "title": "The A-Frame in Mraza",
        "costPerNight": 687,
        "numOfBeds": 4,
        "locationType": "APARTMENT",
        "location": {
            "latitude": 45.5165,
            "longitude": -122.6808
        },
        "pictures": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-10.png"
    },
    // ... additional listings  
];

// Immediately Invoked Async Function to call the resolver  
(async () => {
    try {
        // Call the getNearbyListings resolver  
        const nearbyListings = await resolvers.Query.getNearbyListings(null, params, { dataSources });
        console.log('Nearby Listings:', JSON.stringify(nearbyListings, null, 2));
    } catch (error) {
        console.error('Error fetching nearby listings:', error);
    }
})();