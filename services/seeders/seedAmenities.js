// seedAmenity.js
import sequelize from '../models/config/seq.js';
import Amenity from '../models/mysql/amenity.js';
import Category from '../models/mysql/category.js';

const seedAmenities = async () => {
  try {
    // Ensure DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Optional: Sync table (creates if not exists)
    await Amenity.sync({ alter: true }); // use { force: true } to drop & recreate

    // Fetch categories to get valid categoryId
    const categories = await Category.findAll();
    if (!categories.length) {
      console.log('⚠️ No categories found, please seed categories first');
      return;
    }

    // Sample amenities data
    const amenitiesData = [
      {
        name: 'WiFi',
        categoryId: categories[0].id,
        locationId: 'loc-1',
        description: 'High-speed internet',
      },
      {
        name: 'Air Conditioning',
        categoryId: categories[0].id,
        locationId: 'loc-2',
        description: 'Cool and comfortable rooms',
      },
      {
        name: 'Parking',
        categoryId: categories[0].id,
        locationId: 'loc-3',
        description: 'Secure parking lot',
      },
    ];

    // Insert each amenity if it does not exist
    for (const amenity of amenitiesData) {
      const [record, created] = await Amenity.findOrCreate({
        where: { name: amenity.name, categoryId: amenity.categoryId },
        defaults: amenity,
      });
      console.log(`${created ? 'Created' : 'Exists'}: ${record.name}`);
    }

    console.log('✅ Amenities seeding completed');
    await sequelize.close();
  } catch (error) {
    console.error('Error seeding amenities:', error);
  }
};

// Run the seed
seedAmenities();
