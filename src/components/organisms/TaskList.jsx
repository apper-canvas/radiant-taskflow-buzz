import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from '@/components/molecules/TaskCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import EmptyState from '@/components/organisms/EmptyState';
import ErrorState from '@/components/organisms/ErrorState';

const TaskList = ({ 
  tasks = [], 
  loading = false, 
  error = null,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onRetry,
  searchQuery = '',
  activeCategory = null,
  sortBy = 'created'
}) => {
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(task => task.category === activeCategory);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        
        case 'created':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    // Separate completed and incomplete tasks
    const incomplete = filtered.filter(task => !task.completed);
    const completed = filtered.filter(task => task.completed);

    return [...incomplete, ...completed];
  }, [tasks, searchQuery, activeCategory, sortBy]);

  const handleTaskUpdate = (updatedTask) => {
    if (onTaskUpdate) {
      onTaskUpdate(updatedTask);
    }
  };

  const handleTaskDelete = (taskId) => {
    setDeletingTaskId(taskId);
    setTimeout(() => {
      if (onTaskDelete) {
        onTaskDelete(taskId);
      }
      setDeletingTaskId(null);
    }, 300);
  };

  const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1 }
    })
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <SkeletonLoader height="h-20" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (filteredAndSortedTasks.length === 0) {
    const getEmptyMessage = () => {
      if (searchQuery) {
        return {
          title: 'No tasks found',
          description: `No tasks match "${searchQuery}". Try adjusting your search.`,
          actionLabel: 'Clear Search',
          onAction: () => window.location.reload()
        };
      }
      
      if (activeCategory) {
        return {
          title: `No ${activeCategory} tasks`,
          description: `You don't have any tasks in the ${activeCategory} category yet.`,
          actionLabel: 'Create Task',
          onAction: () => {} // Handle in parent
        };
      }

      return {
        title: 'No tasks yet',
        description: 'Create your first task to get started with TaskFlow.',
        actionLabel: 'Create Your First Task',
        onAction: () => {} // Handle in parent
      };
    };

    const emptyProps = getEmptyMessage();
    
    return (
      <EmptyState
        icon="CheckSquare"
        title={emptyProps.title}
        description={emptyProps.description}
        actionLabel={emptyProps.actionLabel}
        onAction={emptyProps.onAction}
      />
    );
  }

  const incompleteTasks = filteredAndSortedTasks.filter(task => !task.completed);
  const completedTasks = filteredAndSortedTasks.filter(task => task.completed);

  return (
    <div className="space-y-6">
      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-surface-900 mb-4">
            Active Tasks ({incompleteTasks.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {incompleteTasks.map((task, index) => (
                <motion.div
                  key={task.Id}
                  custom={index}
                  variants={staggerItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ 
                    opacity: 0, 
                    scale: 0.95,
                    x: deletingTaskId === task.Id ? -100 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <TaskCard
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                    onEdit={onTaskEdit}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-surface-500 mb-4">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {completedTasks.map((task, index) => (
                <motion.div
                  key={task.Id}
                  custom={index}
                  variants={staggerItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ 
                    opacity: 0, 
                    scale: 0.95,
                    x: deletingTaskId === task.Id ? -100 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <TaskCard
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                    onEdit={onTaskEdit}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;