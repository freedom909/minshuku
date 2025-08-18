import  Category  from '../models/mysql/category.js';
import sequelize from '../models/config/seq.js';


const seedCategories = async () => {
  await Category.bulkCreate([
    { id: 'room', name: 'Room' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'outdoor', name: 'Outdoor' },
  ], { ignoreDuplicates: true });
  console.log('✅ Categories seeded');
};

seedCategories();
