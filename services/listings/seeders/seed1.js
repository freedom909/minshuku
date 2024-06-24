import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Define listingsData directly within the file
const listingsData = [
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
    "longitude": 56.78
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
    "longitude": 56.78
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
    "longitude": 34.56
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
    "isFeatured": true
  },
  {
    "costPerNight": 580.0,
    "title": "The Qo’noS Mountaintop Cabin",
    "locationType": "HOUSE",
    "description": "The name speaks for itself! Come enjoy our comfortable cabin with amazing views of neighboring planets.",
    "id": "listing-5",
    "numOfBeds": 1,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353889/odyssey/federation-course2/illustrations/listings-05.png",
    "hostId": "user-1"
  },
  {
    "costPerNight": 330.0,
    "title": "Cozy room in Vaperi V mansion with aircraft access",
    "locationType": "SPACESHIP",
    "description": "Just like the cottages one might find on Earth, but on an entirely different planet.",
    "id": "listing-6",
    "numOfBeds": 1,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-06.png",
    "hostId": "user-4"
  },
  {
    "costPerNight": 430.0,
    "title": "Interstellar cottage in Vaperi III",
    "locationType": "ROOM",
    "description": "Just like the cottages one might find on Earth, but on an entirely different planet.",
    "id": "listing-7",
    "numOfBeds": 2,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-07.png",
    "hostId": "user-4"
  },
  {
    "costPerNight": 688.0,
    "title": "The Pod in Origae-6",
    "locationType": "SPACESHIP",
    "description": "Enjoy a converted pod in Origae-6! Originally from Earth, this craft has been completely renovated for space travel. We offer complimentary home-away-from-homeworld breakfast from 0800 to 0802. This spaceship features a full temperature control system, a droid concierge and a self-cleaning bathroom. Plasma lighting system is all automatic and cannot be manually overriden. Though this pod is small, it is homey.",
    "id": "listing-8",
    "numOfBeds": 3,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-08.png",
    "hostId": "user-5"
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
    "isFeatured": true
  },
  {
    "costPerNight": 687.0,
    "title": "The A-Frame in Mraza",
    "locationType": "APARTMENT",
    "description": "Just like the cottages one might find on Earth, but on an entirely different planet.",
    "id": "listing-10",
    "numOfBeds": 4,
    "photoThumbnail": "https://res.cloudinary.com/apollographql/image/upload/v1644353890/odyssey/federation-course2/illustrations/listings-10.png",
    "hostId": "user-6"
  }
];

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Ensure the Listings table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Listings (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      costPerNight FLOAT,
      hostId VARCHAR(255),
      locationType VARCHAR(255),
      numOfBeds INT,
      photoThumbnail VARCHAR(255),
      isFeatured BOOLEAN,
      latitude FLOAT,
      longitude FLOAT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  // Insert data from listingsData
  const insertQuery = `
    INSERT INTO Listings (id, title, description, costPerNight, hostId, locationType, numOfBeds, photoThumbnail, isFeatured, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const listing of listingsData) {
    await connection.query(insertQuery, [
      listing.id,
      listing.title,
      listing.description,
      listing.costPerNight,
      listing.hostId,
      listing.locationType,
      listing.numOfBeds,
      listing.photoThumbnail,
      listing.isFeatured,
      listing.latitude,
      listing.longitude
    ]);
  }

  console.log('Database seeded successfully.');
  await connection.end();
}

seedDatabase().catch(console);
