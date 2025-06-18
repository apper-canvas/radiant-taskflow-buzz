import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import CategoryFilter from '@/components/molecules/CategoryFilter';
import TaskList from '@/components/organisms/TaskList';
import TaskForm from '@/components/molecules/TaskForm';
import { taskService, categoryService } from '@/services';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState('created');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [allTasks, allCategories] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      
      setTasks(allTasks);
      setCategories(allCategories);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.Id === updatedTask.Id ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId) => {
setTasks(prev => prev.filter(task => task.Id !== taskId));
  };

  const handleTaskCreate = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleFormSubmit = (task) => {
    if (editingTask) {
      handleTaskUpdate(task);
    } else {
      handleTaskCreate(task);
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const getTaskCounts = () => {
    const counts = {};
    categories.forEach(category => {
counts[category.Name || category.name] = tasks.filter(task => task.category === (category.Name || category.name)).length;
    });
    return counts;
  };

  const taskCounts = getTaskCounts();
  const totalTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="lg:w-80 bg-white border-r border-surface-200 flex-shrink-0">
        <div className="p-6 h-full overflow-y-auto">
          {/* Quick Stats */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Clock" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-surface-600">Active</span>
                </div>
                <p className="text-2xl font-bold text-surface-900 mt-1">{totalTasks}</p>
              </div>
              <div className="bg-gradient-to-br from-success/10 to-success/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="CheckCircle2" size={16} className="text-success" />
                  <span className="text-sm font-medium text-surface-600">Done</span>
                </div>
                <p className="text-2xl font-bold text-surface-900 mt-1">{completedTasks}</p>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            taskCounts={taskCounts}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-surface-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-surface-900">
{activeCategory ? `${activeCategory} Tasks` : 'All Tasks'}
              </h1>
              <p className="text-surface-600 mt-1">
                Manage your tasks and stay productive
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <SearchBar
                onSearch={setSearchQuery}
                className="w-64"
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-surface-300 rounded-lg focus:border-primary focus-ring smooth-transition"
              >
                <option value="created">Recent</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
              </select>
              
              <Button onClick={() => setShowTaskForm(true)}>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskEdit={handleTaskEdit}
            onRetry={loadData}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            sortBy={sortBy}
          />
        </div>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleFormCancel}
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
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <button
                    onClick={handleFormCancel}
                    className="p-2 hover:bg-surface-100 rounded-lg smooth-transition"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
                
                <TaskForm
                  task={editingTask}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;