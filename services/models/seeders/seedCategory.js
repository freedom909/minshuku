// seedCategoriesFull.js
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'air',
  process.env.DB_USER || 'root',
  
  process.env.DB_PASSWORD || 'princess',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    logging: console.log,
  }
);

// Define Category model
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING, allowNull: false }, // 'theme' or 'space'
  featured_title: { type: DataTypes.STRING, allowNull: true },
  featured_booked_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'categories',
  timestamps: false,
});

async function resetAndSeedCategories() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
await Category.sync({ force: false }); // creates table if it doesn't exist
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Clear table
    await Category.destroy({ where: {}, truncate: true });

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('🧹 All categories cleared');

    // Seed categories
    const categoriesData = [
      // Theme categories with featured listings
      { name: 'Traditional', image: 'icon', type: 'theme', featured_title: 'Kyoto Inn', featured_booked_count: 553 },
      { name: 'Modern', image: 'icon', type: 'theme', featured_title: 'Beach House', featured_booked_count: 190 },
      { name: 'Nature', image: 'icon', type: 'theme', featured_title: 'Mountain Cabin', featured_booked_count: 842 },
      { name: 'Luxury', image: 'icon', type: 'theme', featured_title: 'City Loft', featured_booked_count: 458 },

      // Room/Space categories
      { name: 'Room', image: 'icon', type: 'space' },
      { name: 'Kitchen', image: 'icon', type: 'space' },
      { name: 'Bathroom', image: 'icon', type: 'space' },
      { name: 'Bedroom', image: 'icon', type: 'space' },
      { name: 'Living Room', image: 'icon', type: 'space' },
      { name: 'Outdoor', image: 'icon', type: 'space' },
    ];

    for (const category of categoriesData) {
      const [cat, created] = await Category.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
      console.log(created ? `🟢 Created: ${cat.name}` : `🔵 Already exists: ${cat.name}`);
    }

    console.log('✅ Seeding completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAndSeedCategories();
