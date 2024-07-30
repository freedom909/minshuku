import sequelize from '../models/sequelize.js';
import Amenity from '../models/amenity.js';
import Listing from '../models/listing.js'; // Assuming you have a Listing model
import ListingAmenities from '../models/listingamenities.js'; 
// import listingsData from './listings.json' assert { type: 'json' };
// import amenitiesData from './amenities.json' assert { type: 'json' };
// import listingAmenitiesData from './listingamenities.json' assert { type: 'json' };
const listingsData=
  
[
  {
    "costPerNight": 120.0,
    "title": "Cave campsite in snowy MoundiiX",
    "locationType": "CAMPSITE",
    "description": "Enjoy this amazing cave campsite in snow MoundiiX, where you'll be one with the nature and wildlife in this wintery planet. All space survival amenities are available. We have complementary dehydrated wine upon your arrival. Check in between 34:00 and 72:00. The nearest village is 3AU away, so please plan accordingly. Recommended for extreme outdoor adventurers.",
    "id": "listing-1",
    "numOfBeds": 2,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644350721/odyssey/federation-course2/illustrations/listings-01.png",
    "hostId": "user-1",
    "isFeatured": true,
    "latitude": 12.34, 
    "longitude": 56.78,
    "saleAmount": 20.1,
    "bookingNumber":109
  },
  {
    "costPerNight": 592.0,
    "title": "Cozy yurt in Mraza",
    "locationType": "ROOM",
    "description": "Thiz cozy yurt has an aerodyne hull and efficient sublight engines. It is equipped with an advanced sensor system and defensive force shield. Meteor showers are quite common, please rest assured that our Kevlar-level shields will keep you safe from any space debris. Mraza suns are known to have high levels of UV hyper radiation, which we counteract with the yurt's UV protection shield.",
    "id": "listing-2",
    "numOfBeds": 1,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644350839/odyssey/federation-course2/illustrations/listings-02.png",
    "hostId": "user-1",
    "isFeatured": true,
    "latitude": 12.34, 
    "longitude": 56.78,
    "saleAmount": 10.1,
    "bookingNumber":108,
  },
  {
    "costPerNight": 313.0,
    "title": "Repurposed mid century aircraft in Kessail",
    "locationType": "SPACESHIP",
    "description": "Enjoy this floaty, repurposed aircraft reminiscent of Earth’s former converted airstreams. Includes lake access!",
    "id": "listing-3",
    "numOfBeds": 5,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353887/odyssey/federation-course2/illustrations/listings-03.png",
    "hostId": "user-1",
    "latitude": 90.12, 
    "longitude": 34.56,
    "saleAmount": 0.91,
    "bookingNumber":107
  },
  {
    "costPerNight": 520.0,
    "title": "Repurposed mid century home in Kessail",
    "locationType": "HOUSE",
    "description": "Enjoy a converted mid-century home in Kessail. Originally from Earth, this craft has been completely renovated for outer space. Kessail features sunny weather with a chance of deorbitting debris. We have many transportation options available to you should you choose to venture outside.",
    "id": "listing-4",
    "numOfBeds": 3,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353888/odyssey/federation-course2/illustrations/listings-04.png",
    "hostId": "user-1",
    "isFeatured": true,
    "saleAmount": 0.81,
    "bookingNumber":106
  },
  {
    "costPerNight": 580.0,
    "title": "The Qo’noS Mountaintop Cabin",
    "locationType": "HOUSE",
    "description": "The name speaks for itself! Come enjoy our comfortable cabin with amazing views of neighboring planets.",
    "id": "listing-5",
    "numOfBeds": 1,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353889/odyssey/federation-course2/illustrations/listings-05.png",
    "hostId": "user-1",
    "saleAmount": 0.71,
    "bookingNumber":105
  },
  {
    "costPerNight": 330.0,
    "title": "Cozy room in Vaperi V mansion with aircraft access",
    "locationType": "SPACESHIP",
    "description": "Just like the cottages one might find on Earth, but on an entirely different planet.",
    "id": "listing-6",
    "numOfBeds": 1,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-06.png",
    "hostId": "user-4",
    "saleAmount": 0.61,
    "bookingNumber":104
  },
  {
    "costPerNight": 430.0,
    "title": "Interstellar cottage in Vaperi III",
    "locationType": "ROOM",
    "description": "Just like the cottages one might find on Earth, but on an entirely different planet.",
    "id": "listing-7",
    "numOfBeds": 2,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-07.png",
    "hostId": "user-4",
    "saleAmount": 0.51,
    "bookingNumber":103
  },
  {
    "costPerNight": 688.0,
    "title": "The Pod in Origae-6",
    "locationType": "SPACESHIP",
    "description": "Enjoy a converted pod in Origae-6! Originally from Earth, this craft has been completely renovated for space travel. We offer complimentary home-away-from-homeworld breakfast from 0800 to 0802. This spaceship features a full temperature control system, a droid concierge and a self-cleaning bathroom. Plasma lighting system is all automatic and cannot be manually overriden. Though this pod is small, it is homey.",
    "id": "listing-8",
    "numOfBeds": 3,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-08.png",
    "hostId": "user-5",
    "saleAmount": 0.41,
    "bookingNumber":102
  },
  {
    "costPerNight": 474.0,
    "title": "The Nostromo in LV-426",
    "locationType": "HOUSE",
    "description": "Ever wondered what it must be like to be aboard The Nostromo, minus the Xenomorph? Now you can find out!",
    "id": "listing-9",
    "numOfBeds": 4,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353889/odyssey/federation-course2/illustrations/listings-09.png",
    "hostId": "user-6",
    "isFeatured": true,
    "saleAmount": 0.31,
    "bookingNumber":101
  },
  {
    "costPerNight": 687.0,
    "title": "The A-Frame in Mraza",
    "locationType": "APARTMENT",
    "description": "Just like the cottages one might find on Earth, but on an entirely different planet.",
    "id": "listing-10",
    "numOfBeds": 4,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-10.png",
    "hostId": "user-6",
    "saleAmount": 0.21,
    "bookingNumber":100
  }
]
;
const amenitiesData =[
  
    { "id": "am-1", "category": "Accommodation Details", "name": "Interdimensional wifi" },
    { "id": "am-2", "category": "Accommodation Details", "name": "Towel" },
    { "id": "am-3", "category": "Accommodation Details", "name": "Universal remote" },
    { "id": "am-4", "category": "Accommodation Details", "name": "Adjustable gravity" },
    { "id": "am-5", "category": "Accommodation Details", "name": "Quantum microwave" },
    { "id": "am-6", "category": "Accommodation Details", "name": "Retractable moonroof" },
    { "id": "am-7", "category": "Accommodation Details", "name": "Wormhole trash chute" },
    { "id": "am-8", "category": "Accommodation Details", "name": "DroneDash food delivery" },
    { "id": "am-9", "category": "Accommodation Details", "name": "Cosmic jacuzzi" },
    {"id": "am-28", "category": "Accommodation Details", "name": "Multi-planetary cable TV"},
    {"id": "am-29", "category": "Accommodation Details", "name": "Cryochamber"},
    {"id": "am-30", "category": "Accommodation Details", "name": "Heated sleeping pods"},
    { "id": "am-10", "category": "Space Survival", "name": "Oxygen" },
    { "id": "am-11", "category": "Space Survival", "name": "Prepackaged meals" },
    { "id": "am-12", "category": "Space Survival", "name": "SOS button" },
    { "id": "am-13", "category": "Space Survival", "name": "Meteor shower shield" },
    { "id": "am-14", "category": "Space Survival", "name": "First-aid kit" },
    { "id": "am-15", "category": "Space Survival", "name": "Water recycler" },
    { "id": "am-16", "category": "Space Survival", "name": "Panic button" },
    { "id": "am-17", "category": "Space Survival", "name": "Emergency life support systems" },
    { "id": "am-18", "category": "Space Survival", "name": "Universal translator" },
    { "id": "am-31", "category": "Space Survival", "name": "Aquatic breathing aid" },
    { "id": "am-19", "category": "Outdoors", "name": "Fire pit" },
    { "id": "am-20", "category": "Outdoors", "name": "Acid lake access" },
    { "id": "am-21", "category": "Outdoors", "name": "Waterfront" },
    { "id": "am-22", "category": "Outdoors", "name": "Hydroponic garden" },
    { "id": "am-23", "category": "Outdoors", "name": "Space view" },
    { "id": "am-24", "category": "Outdoors", "name": "Time travel paradoxes" },
    { "id": "am-25", "category": "Outdoors", "name": "Tourist attraction" },
    { "id": "am-26", "category": "Outdoors", "name": "Meteor showers" },
    { "id": "am-27", "category": "Outdoors", "name": "Wildlife" } 
];
const listingAmenitiesData=[
  
    { "AmenityId": "am-2", "ListingId": "listing-1" },
    { "AmenityId": "am-10", "ListingId": "listing-1" },
    { "AmenityId": "am-11", "ListingId": "listing-1" },
    { "AmenityId": "am-12", "ListingId": "listing-1" },
    { "AmenityId": "am-13", "ListingId": "listing-1" },
    { "AmenityId": "am-26", "ListingId": "listing-1" },
    { "AmenityId": "am-27", "ListingId": "listing-1" },
    { "AmenityId": "am-16", "ListingId": "listing-1" },
    { "AmenityId": "am-15", "ListingId": "listing-1" },
    { "AmenityId": "am-14", "ListingId": "listing-1" },
    { "AmenityId": "am-17", "ListingId": "listing-1" },
    { "AmenityId": "am-18", "ListingId": "listing-1" },
    { "AmenityId": "am-31", "ListingId": "listing-1" },
    { "AmenityId": "am-20", "ListingId": "listing-1" },
    { "AmenityId": "am-24", "ListingId": "listing-1" },
  
    { "AmenityId": "am-1", "ListingId": "listing-2" },
    { "AmenityId": "am-4", "ListingId": "listing-2" },
    { "AmenityId": "am-7", "ListingId": "listing-2" },
    { "AmenityId": "am-28", "ListingId": "listing-2" },
    { "AmenityId": "am-2", "ListingId": "listing-2" },
    { "AmenityId": "am-5", "ListingId": "listing-2" },
    { "AmenityId": "am-29", "ListingId": "listing-2" },
    { "AmenityId": "am-3", "ListingId": "listing-2" },
    { "AmenityId": "am-6", "ListingId": "listing-2" },
    { "AmenityId": "am-9", "ListingId": "listing-2" },
    { "AmenityId": "am-30", "ListingId": "listing-2" },
    { "AmenityId": "am-16", "ListingId": "listing-2" },
    { "AmenityId": "am-17", "ListingId": "listing-2" },
    { "AmenityId": "am-14", "ListingId": "listing-2" },
    { "AmenityId": "am-13", "ListingId": "listing-2" },
    { "AmenityId": "am-23", "ListingId": "listing-2" },
    { "AmenityId": "am-26", "ListingId": "listing-2" },
    { "AmenityId": "am-22", "ListingId": "listing-2" },
    { "AmenityId": "am-12", "ListingId": "listing-2" },
    { "AmenityId": "am-10", "ListingId": "listing-2" },
    { "AmenityId": "am-15", "ListingId": "listing-2" },
    { "AmenityId": "am-18", "ListingId": "listing-2" },
  
    { "AmenityId": "am-15", "ListingId": "listing-3" },
    { "AmenityId": "am-16", "ListingId": "listing-3" },
    { "AmenityId": "am-17", "ListingId": "listing-3" },
    { "AmenityId": "am-4", "ListingId": "listing-3" },
    { "AmenityId": "am-5", "ListingId": "listing-3" },
    { "AmenityId": "am-6", "ListingId": "listing-3" },
    { "AmenityId": "am-7", "ListingId": "listing-3" },
  
    { "AmenityId": "am-1", "ListingId": "listing-4" },
    { "AmenityId": "am-28", "ListingId": "listing-4" },
    { "AmenityId": "am-5", "ListingId": "listing-4" },
    { "AmenityId": "am-3", "ListingId": "listing-4" },
    { "AmenityId": "am-9", "ListingId": "listing-4" },
    { "AmenityId": "am-14", "ListingId": "listing-4" },
    { "AmenityId": "am-12", "ListingId": "listing-4" },
    { "AmenityId": "am-19", "ListingId": "listing-4" },
    { "AmenityId": "am-22", "ListingId": "listing-4" },
    { "AmenityId": "am-25", "ListingId": "listing-4" },
    { "AmenityId": "am-20", "ListingId": "listing-4" },
    { "AmenityId": "am-21", "ListingId": "listing-4" },
    { "AmenityId": "am-23", "ListingId": "listing-4" },
    { "AmenityId": "am-24", "ListingId": "listing-4" },
  
    { "AmenityId": "am-1", "ListingId": "listing-5" },
    { "AmenityId": "am-2", "ListingId": "listing-5" },
    { "AmenityId": "am-3", "ListingId": "listing-5" },
    { "AmenityId": "am-4", "ListingId": "listing-5" },
    { "AmenityId": "am-5", "ListingId": "listing-5" },
    { "AmenityId": "am-6", "ListingId": "listing-5" },
    { "AmenityId": "am-7", "ListingId": "listing-5" },
    { "AmenityId": "am-11", "ListingId": "listing-5" },
    { "AmenityId": "am-12", "ListingId": "listing-5" },
    { "AmenityId": "am-13", "ListingId": "listing-5" },
    { "AmenityId": "am-14", "ListingId": "listing-5" },
    { "AmenityId": "am-15", "ListingId": "listing-5" },
    { "AmenityId": "am-16", "ListingId": "listing-5" },
    { "AmenityId": "am-17", "ListingId": "listing-5" },
  
    { "AmenityId": "am-1", "ListingId": "listing-6" },
    { "AmenityId": "am-2", "ListingId": "listing-6" },
    { "AmenityId": "am-3", "ListingId": "listing-6" },
    { "AmenityId": "am-4", "ListingId": "listing-6" },
    { "AmenityId": "am-5", "ListingId": "listing-6" },
    { "AmenityId": "am-6", "ListingId": "listing-6" },
    { "AmenityId": "am-7", "ListingId": "listing-6" },
  
    { "AmenityId": "am-1", "ListingId": "listing-7" },
    { "AmenityId": "am-2", "ListingId": "listing-7" },
    { "AmenityId": "am-3", "ListingId": "listing-7" },
    { "AmenityId": "am-4", "ListingId": "listing-7" },
    { "AmenityId": "am-5", "ListingId": "listing-7" },
    { "AmenityId": "am-6", "ListingId": "listing-7" },
    { "AmenityId": "am-7", "ListingId": "listing-7" },
  
    { "AmenityId": "am-1", "ListingId": "listing-8" },
    { "AmenityId": "am-2", "ListingId": "listing-8" },
    { "AmenityId": "am-3", "ListingId": "listing-8" },
    { "AmenityId": "am-4", "ListingId": "listing-8" },
    { "AmenityId": "am-5", "ListingId": "listing-8" },
    { "AmenityId": "am-6", "ListingId": "listing-8" },
    { "AmenityId": "am-7", "ListingId": "listing-8" },
  
    { "AmenityId": "am-1", "ListingId": "listing-9" },
    { "AmenityId": "am-2", "ListingId": "listing-9" },
    { "AmenityId": "am-3", "ListingId": "listing-9" },
    { "AmenityId": "am-4", "ListingId": "listing-9" },
    { "AmenityId": "am-5", "ListingId": "listing-9" },
    { "AmenityId": "am-6", "ListingId": "listing-9" },
    { "AmenityId": "am-7", "ListingId": "listing-9" },
    { "AmenityId": "am-10", "ListingId": "listing-9" },
    { "AmenityId": "am-22", "ListingId": "listing-9" },
    { "AmenityId": "am-23", "ListingId": "listing-9" },
    { "AmenityId": "am-24", "ListingId": "listing-9" },
    { "AmenityId": "am-15", "ListingId": "listing-9" },
    { "AmenityId": "am-16", "ListingId": "listing-9" },
    { "AmenityId": "am-17", "ListingId": "listing-9" },
  
    { "AmenityId": "am-1", "ListingId": "listing-10" },
    { "AmenityId": "am-2", "ListingId": "listing-10" },
    { "AmenityId": "am-24", "ListingId": "listing-10" },
    { "AmenityId": "am-25", "ListingId": "listing-10" },
    { "AmenityId": "am-26", "ListingId": "listing-10" },
    { "AmenityId": "am-10", "ListingId": "listing-10" },
    { "AmenityId": "am-11", "ListingId": "listing-10" }
]
async function main() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected to database.");

    // Sync all defined models to the DB
    await sequelize.sync({ force: true });

    console.log("Seeding amenities...");
    const amenities = amenitiesData.map(item => ({ ...item, createdAt: new Date(), updatedAt: new Date() }));
    await Amenity.bulkCreate(amenities);
    console.log("Amenities seeded.");

    console.log("Seeding listings...");
    const listings = listingsData.map(item => ({ ...item, createdAt: new Date(), updatedAt: new Date() }));
    await Listing.bulkCreate(listings);
    console.log("Listings seeded.");

    console.log("Seeding listing amenities...");
    const listingAmenities = listingAmenitiesData.map(item => ({
      listingId: item.ListingId,
      amenityId: item.AmenityId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await ListingAmenities.bulkCreate(listingAmenities);
    console.log("Listing amenities seeded.");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await sequelize.close();
    console.log("Disconnected from database.");
  }
}

main().catch(e => {
  console.error("Script error:", e);
  process.exit(1);
});