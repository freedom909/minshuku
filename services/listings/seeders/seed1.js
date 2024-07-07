import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Define listingsData directly within the file
const listingsData =
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
    "bookingNumber": 109
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
    "bookingNumber": 108
  }
]

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
      saleAmount FLOAT,
      bookingNumber INT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  // Insert data from listingsData with ON DUPLICATE KEY UPDATE
  const insertQuery = `
    INSERT INTO Listings (id, title, description, costPerNight, hostId, locationType, numOfBeds, photoThumbnail, isFeatured, latitude, longitude, saleAmount, bookingNumber)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    costPerNight = VALUES(costPerNight),
    hostId = VALUES(hostId),
    locationType = VALUES(locationType),
    numOfBeds = VALUES(numOfBeds),
    photoThumbnail = VALUES(photoThumbnail),
    isFeatured = VALUES(isFeatured),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    saleAmount = VALUES(saleAmount),
    bookingNumber = VALUES(bookingNumber),
    updatedAt = CURRENT_TIMESTAMP
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
      listing.longitude,
      listing.saleAmount,
      listing.bookingNumber
    ]);
  }

  console.log('Database seeded successfully.');
  await connection.end();
}

seedDatabase().catch(console);
