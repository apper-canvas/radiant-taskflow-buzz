import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import EmptyState from '@/components/organisms/EmptyState';
import ErrorState from '@/components/organisms/ErrorState';
import { categoryService, taskService } from '@/services';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#5B4FE9',
    icon: 'Tag'
  });

  const iconOptions = [
    'Tag', 'Briefcase', 'User', 'Code', 'Heart', 'BookOpen',
    'Home', 'Car', 'Coffee', 'Music', 'Camera', 'Gamepad2'
  ];

  const colorOptions = [
    '#5B4FE9', '#8B85F0', '#FF6B6B', '#4ECDC4', '#FFD93D',
    '#4DABF7', '#69DB7C', '#FF8CC8', '#9775FA', '#FFA94D'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [allCategories, allTasks] = await Promise.all([
        categoryService.getAll(),
        taskService.getAll()
      ]);
      
      setCategories(allCategories);
      setTasks(allTasks);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTaskCount = (categoryName) => {
return tasks.filter(task => task.category === categoryName).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      let result;
      
      if (editingCategory) {
result = await categoryService.update(editingCategory.Id, formData);
        setCategories(prev => prev.map(cat => 
          cat.Id === result.Id ? result : cat
        ));
        toast.success('Category updated successfully!');
      } else {
        result = await categoryService.create(formData);
setCategories(prev => [result, ...prev]);
        toast.success('Category created successfully!');
      }

      setShowCreateForm(false);
      setEditingCategory(null);
      setFormData({ name: '', color: '#5B4FE9', icon: 'Tag' });
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.Name || category.name,
      color: category.color,
      icon: category.icon
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (categoryId) => {
const category = categories.find(cat => cat.Id === categoryId);
    const taskCount = getCategoryTaskCount(category.Name || category.name);
    
    if (taskCount > 0) {
      toast.error(`Cannot delete category with ${taskCount} tasks. Move or delete tasks first.`);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
await categoryService.delete(categoryId);
      setCategories(prev => prev.filter(cat => cat.Id !== categoryId));
      toast.success('Category deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCategory(null);
    setFormData({ name: '', color: '#5B4FE9', icon: 'Tag' });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader height="h-8" width="w-64" className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} height="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Categories</h1>
            <p className="text-surface-600 mt-2">
              Organize your tasks with custom categories
            </p>
          </div>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <EmptyState
            icon="Tag"
            title="No categories yet"
            description="Create your first category to organize your tasks better."
            actionLabel="Create Category"
            onAction={() => setShowCreateForm(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {categories.map((category, index) => {
const taskCount = getCategoryTaskCount(category.Name || category.name);
                
                return (
                  <motion.div
key={category.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}
                    className="bg-white rounded-lg border border-surface-200 p-6 smooth-transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <ApperIcon 
                            name={category.icon} 
                            size={20} 
                            style={{ color: category.color }}
                          />
                        </div>
                        <div>
<h3 className="font-semibold text-surface-900">
                            {category.Name || category.name}
                          </h3>
                          <Badge variant="default" size="sm">
                            {taskCount} tasks
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="p-2"
                        >
                          <ApperIcon name="Edit2" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
onClick={() => handleDelete(category.Id)}
                          className="p-2 text-error hover:bg-error/10"
                          disabled={taskCount > 0}
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div 
                          className="h-2 rounded-full smooth-transition"
                          style={{ 
                            backgroundColor: category.color,
                            width: taskCount > 0 ? '60%' : '0%'
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={handleCancel}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-surface-900">
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 hover:bg-surface-100 rounded-lg smooth-transition"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Category Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter category name..."
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-3">
                        Icon
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, icon }))}
                            className={`
                              p-3 rounded-lg border-2 smooth-transition hover:border-primary
                              ${formData.icon === icon 
                                ? 'border-primary bg-primary/10' 
                                : 'border-surface-200'
                              }
                            `}
                          >
                            <ApperIcon 
                              name={icon} 
                              size={20} 
                              className={
                                formData.icon === icon ? 'text-primary' : 'text-surface-500'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-3">
                        Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className={`
                              w-12 h-12 rounded-lg border-4 smooth-transition
                              ${formData.color === color 
                                ? 'border-surface-400 scale-110' 
                                : 'border-surface-200 hover:border-surface-300'
                              }
                            `}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingCategory ? 'Update Category' : 'Create Category'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoriesPage;