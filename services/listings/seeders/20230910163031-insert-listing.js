import { Sequelize, DataTypes } from 'sequelize';
import listingsData from './listings.json' assert { type: 'json' };
import amenitiesData from './amenities.json' assert { type: 'json' };
import listingamenitiesData from './listingamenities.json' assert { type: 'json' };
import config from '../config/config.json' assert { type: 'json' };

// Initialize Sequelize
const env = 'development';
const { database, username, password, host, dialect } = config[env];
const sequelize = new Sequelize(database, username, password, {
    host,
    dialect
  });

// Define models
const ListingAmenities = sequelize.define('ListingAmenities', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amenityId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, { timestamps: true });

// Assuming Listing and Amenity models are defined somewhere
// Listing.belongsToMany(Amenity, { through: ListingAmenities, foreignKey: 'listingId' });
// Amenity.belongsToMany(Listing, { through: ListingAmenities, foreignKey: 'amenityId' });

async function main() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connected to database.");

    // Sync all defined models to the DB
    await sequelize.sync({ force: true });

    // Seeding listing amenities
    console.log("Seeding listing amenities...");
    const listingAmenities = listingamenitiesData.map(item => ({ ...item, createdAt: new Date(), updatedAt: new Date() }));
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
