import { Sequelize } from 'sequelize';
import ListingService from './listingService.js'; // Adjust the path as necessary
import ListingRepository from './listingService.js'; // Adjust the path as necessary

const sequelize = new Sequelize('air', 'root', 'princess', {
  host: 'localhost',
  dialect: 'mysql',
});

const listingRepository = new ListingRepository();

const listingService = new ListingService(listingRepository, sequelize);

const testId = 'listing-1'; // Use a valid ID from your listings table
listingService.getListing(testId).then(listing => {
  console.log('Fetched listing:', listing);
}).catch(error => {
  console.error('Error:', error);
});

listingService.getCoordinates(testId).then(coordinates => {
  console.log('Fetched coordinates:', coordinates);
}).catch(error => {
  console.error('Error:', error);
});

// async function fetchListing(listingId) {
//   try {
//     const listing = await listingService.getListing(listingId);
//     console.log('Fetched listing:', listing);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// fetchListing('listing-1');