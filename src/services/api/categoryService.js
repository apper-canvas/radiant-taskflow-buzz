import categoriesData from '../mockData/categories.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let categories = [...categoriesData];

const categoryService = {
  async getAll() {
    await delay(200);
    return [...categories];
  },

  async getById(id) {
    await delay(200);
    const category = categories.find(c => c.Id === parseInt(id, 10));
    return category ? { ...category } : null;
  },

  async create(categoryData) {
    await delay(300);
    const newCategory = {
      ...categoryData,
      Id: Math.max(...categories.map(c => c.Id), 0) + 1
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, updates) {
    await delay(300);
    const index = categories.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = {
      ...categories[index],
      ...updates,
      Id: categories[index].Id // Prevent ID modification
    };
    
    categories[index] = updatedCategory;
    return { ...updatedCategory };
  },

  async delete(id) {
    await delay(300);
    const index = categories.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const deletedCategory = { ...categories[index] };
    categories.splice(index, 1);
    return deletedCategory;
  }
};

export default categoryService;