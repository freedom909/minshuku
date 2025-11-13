import  Category  from '../services/models/mysql/category.js';

(async () => {
  const categories = await Category.findAll();
  console.log(categories);
})();
