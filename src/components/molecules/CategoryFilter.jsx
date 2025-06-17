import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const CategoryFilter = ({ 
  categories = [], 
  activeCategory = null, 
  onCategoryChange,
  taskCounts = {},
  className = '' 
}) => {
  const allTasksCount = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

  const handleCategoryClick = (categoryName) => {
    if (onCategoryChange) {
      onCategoryChange(categoryName === activeCategory ? null : categoryName);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-surface-600 uppercase tracking-wide">
          Categories
        </h3>
      </div>

      {/* All Tasks */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleCategoryClick(null)}
        className={`
          w-full flex items-center justify-between p-3 rounded-lg smooth-transition
          ${activeCategory === null 
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm' 
            : 'text-surface-700 hover:bg-surface-100'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <ApperIcon 
            name="List" 
            size={16} 
            className={activeCategory === null ? 'text-white' : 'text-surface-500'}
          />
          <span className="font-medium">All Tasks</span>
        </div>
        <Badge 
          variant={activeCategory === null ? 'default' : 'default'}
          size="sm"
          className={activeCategory === null ? 'bg-white/20 text-white' : ''}
        >
          {allTasksCount}
        </Badge>
      </motion.button>

      {/* Category List */}
      <div className="space-y-1">
        {categories.map((category) => {
          const isActive = activeCategory === category.name;
          const count = taskCounts[category.name] || 0;

          return (
            <motion.button
              key={category.Id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category.name)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg smooth-transition
                ${isActive 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm' 
                  : 'text-surface-700 hover:bg-surface-100'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: isActive ? 'white' : category.color 
                  }}
                />
                <ApperIcon 
                  name={category.icon} 
                  size={16} 
                  className={isActive ? 'text-white' : 'text-surface-500'}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <Badge 
                variant={isActive ? 'default' : 'default'}
                size="sm"
                className={isActive ? 'bg-white/20 text-white' : ''}
              >
                {count}
              </Badge>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;