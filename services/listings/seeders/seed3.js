import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const listingAmenitiesData = [
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
];

const seedListingAmenities = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS ListingAmenities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      AmenityId VARCHAR(50) NOT NULL,
      ListingId VARCHAR(50) NOT NULL,
      UNIQUE (AmenityId, ListingId)
    );
  `);

  const values = listingAmenitiesData.map(item => `('${item.AmenityId}', '${item.ListingId}')`).join(', ');
  
  await connection.query(`
    INSERT INTO ListingAmenities (AmenityId, ListingId)
    VALUES ${values}
    ON DUPLICATE KEY UPDATE AmenityId=VALUES(AmenityId), ListingId=VALUES(ListingId);
  `);

  console.log('ListingAmenities table has been seeded successfully.');

  await connection.end();
};

seedListingAmenities().catch(err => {
  console.error('Error seeding ListingAmenities table:', err);
});
