// seedAmenity.js
import sequelize from '../config/seq.js';
import Amenity from '../mysql/amenity.js';
import Category from '../mysql/category.js';

const seedAmenities = async () => {
  try {
    // Ensure DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync table (creates if not exists)
    await Amenity.sync({ alter: true });

    // Fetch categories to get valid categoryId
    const categories = await Category.findAll();
    if (!categories.length) {
      console.log('⚠️ No categories found, please seed categories first');
      return;
    }

    // Get the first category ID (or find by name for better reliability)
    const categoryId = categories[0].id;

    // Sample amenities data
    const amenitiesData = [
      {
    
        name: 'WiFi',
        categoryId: categoryId,
        locationId: 'loc-1',
        description: 'High-speed internet',
      },
      {
       
        name: 'Air Conditioning',
        categoryId: categoryId,
        locationId: 'loc-2',
        description: 'Cool and comfortable rooms',
      },
      {
      
        name: 'Parking',
        categoryId: categoryId,
        locationId: 'loc-3',
        description: 'Secure parking lot',
      },
    ];

    // Insert each amenity if it does not exist
    for (const amenity of amenitiesData) {
      const [record, created] = await Amenity.findOrCreate({
        where: { name: amenity.name }, // Use name as unique identifier
        defaults: amenity,
      });
      console.log(`${created ? '✅ Created' : '⚠️ Exists'}: ${record.name}`);
    }

    console.log('✅ Amenities seeding completed');
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error seeding amenities:', error);
  }
};

// Run the seed
seedAmenities();