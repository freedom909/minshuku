import sequelize from '../config/seq.js';
import Category from '../mysql/category.js';   // path to your Category model

const seedCategories = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // 1. CREATE/ENSURE THE TABLE EXISTS
    await Category.sync({ alter: true });   // or { force: true } in dev only

    // 2. NOW INSERT THE DATA
    const categories = [
      { name: 'Room' },
      { name: 'Kitchen' },
      { name: 'Bathroom' },
      { name: 'Bedroom' },
      { name: 'Living Room' },
      { name: 'Outdoor' },
    ];

    await Category.bulkCreate(categories);
    await Category.sync({ force: true }); // drops & recreates table

    console.log('✅ Categories seeded');
  } catch (err) {
    console.error('❌ Error seeding categories:', err);
  } finally {
    await sequelize.close();
  }
};

seedCategories();