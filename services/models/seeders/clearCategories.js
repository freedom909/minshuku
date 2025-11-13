import Category from '../mysql/category.js';  
import sequelize from '../config/seq.js';

async function clearCategories() {
  try {
    // Delete all rows
    await Category.destroy({ where: {} });

    // Optionally reset auto-increment (MySQL only)
    await sequelize.query('ALTER TABLE categories AUTO_INCREMENT = 1;');

    console.log('✅ All categories cleared');
  } catch (err) {
    console.error('❌ Error clearing categories:', err);
  }
}

clearCategories();
