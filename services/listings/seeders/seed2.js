import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const amenitiesData = [
  { "id": "am-1", "category": "Accommodation Details", "name": "Interdimensional wifi" },
  { "id": "am-2", "category": "Accommodation Details", "name": "Towel" },
  { "id": "am-3", "category": "Accommodation Details", "name": "Universal remote" },
  { "id": "am-4", "category": "Accommodation Details", "name": "Adjustable gravity" },
  { "id": "am-5", "category": "Accommodation Details", "name": "Quantum microwave" },
  { "id": "am-6", "category": "Accommodation Details", "name": "Retractable moonroof" },
  { "id": "am-7", "category": "Accommodation Details", "name": "Wormhole trash chute" },
  { "id": "am-8", "category": "Accommodation Details", "name": "DroneDash food delivery" },
  { "id": "am-9", "category": "Accommodation Details", "name": "Cosmic jacuzzi" },
  { "id": "am-28", "category": "Accommodation Details", "name": "Multi-planetary cable TV" },
  { "id": "am-29", "category": "Accommodation Details", "name": "Cryochamber" },
  { "id": "am-30", "category": "Accommodation Details", "name": "Heated sleeping pods" },
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

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Ensure the Amenities table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Amenities (
      id VARCHAR(255) PRIMARY KEY,
      category VARCHAR(255),
      name VARCHAR(255)
    );
  `);

  // Define the insert query
  const insertQuery = `
    INSERT INTO Amenities (id, category, name)
    VALUES (?, ?, ?)
  `;

  // Insert data from amenitiesData
  for (const amenity of amenitiesData) {
    await connection.query(insertQuery, [
      amenity.id,
      amenity.category,
      amenity.name,
    ]);
  }

  console.log('Database seeded successfully.');
  await connection.end();
}

seedDatabase().catch(console.error);
