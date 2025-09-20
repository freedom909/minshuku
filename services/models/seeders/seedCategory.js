import sequelize from '../config/seq.js';
import Category from '../mysql/category.js';   // path to your Category model

const seedCategories = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // 1. CREATE/ENSURE THE TABLE EXISTS

    await Category.sync({ alter: true }); // drops & recreates table
    // 2. NOW INSERT THE DATA
const categories = [
  { name: 'Room', image: 'icon' },
  { name: 'Kitchen', image: 'icon' },
  { name: 'Bathroom', image: 'icon' },
  { name: 'Bedroom', image: 'icon' },
  { name: 'Living Room', image: 'icon' },
  { name: 'Outdoor', image: 'icon' },
];
    for (const cat of categories) {
      await Category.findOrCreate({ where: { name: cat.name }, defaults: cat });
    }
    console.log('✅ Categories seeded');
  } catch (err) {
    console.error('❌ Error seeding categories:', err);
  } finally {
    await sequelize.close();
  }
};

seedCategories();