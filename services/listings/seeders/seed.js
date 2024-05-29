import db from '../models/index.js';
import listingsData from './listings.json' assert { type: 'json' };
import amenitiesData from './amenities.json' assert { type: 'json' };
import listingAmenitiesData from './listingamenities.json' assert { type: 'json' };

async function main() {
  try {
    console.log("Connecting to database...");
    await db.sequelize.authenticate();
    console.log("Connected to database.");

    // Sync all defined models to the DB
    await db.sequelize.sync({ force: true });

    console.log("Seeding amenities...");
    const amenities = amenitiesData.map(item => ({ ...item, createdAt: new Date(), updatedAt: new Date() }));
    await db.Amenity.bulkCreate(amenities);
    console.log("Amenities seeded.");

    console.log("Seeding listings...");
    const listings = listingsData.map(item => ({ ...item, createdAt: new Date(), updatedAt: new Date() }));
    await db.Listing.bulkCreate(listings);
    console.log("Listings seeded.");

    console.log("Seeding listing amenities...");
    const listingAmenities = listingAmenitiesData.map(item => ({
      listingId: item.ListingId,
      amenityId: item.AmenityId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await db.ListingAmenities.bulkCreate(listingAmenities);
    console.log("Listing amenities seeded.");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await db.sequelize.close();
    console.log("Disconnected from database.");
  }
}

main().catch(e => {
  console.error("Script error:", e);
  process.exit(1);
});
