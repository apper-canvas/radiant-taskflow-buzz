import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isThisWeek, isThisMonth } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import TaskCard from '@/components/molecules/TaskCard';
import SkeletonLoader from '@/components/atoms/SkeletonLoader';
import EmptyState from '@/components/organisms/EmptyState';
import ErrorState from '@/components/organisms/ErrorState';
import { taskService } from '@/services';

const CompletedPage = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    loadCompletedTasks();
  }, []);

  const loadCompletedTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allTasks = await taskService.getAll();
      const completed = allTasks.filter(task => task.completed);
      setCompletedTasks(completed);
    } catch (err) {
      setError(err.message || 'Failed to load completed tasks');
      toast.error('Failed to load completed tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    if (updatedTask.completed) {
      setCompletedTasks(prev => prev.map(task => 
        task.Id === updatedTask.Id ? updatedTask : task
      ));
    } else {
      // Task was marked as incomplete, remove from completed list
      setCompletedTasks(prev => prev.filter(task => task.Id !== updatedTask.Id));
    }
  };

  const handleTaskDelete = (taskId) => {
    setCompletedTasks(prev => prev.filter(task => task.Id !== taskId));
  };

  const filterTasksByTime = (tasks) => {
    if (timeFilter === 'all') return tasks;
    
    return tasks.filter(task => {
      if (!task.completedAt) return false;
      
      const completedDate = parseISO(task.completedAt);
      
      switch (timeFilter) {
        case 'week':
          return isThisWeek(completedDate);
        case 'month':
          return isThisMonth(completedDate);
        default:
          return true;
      }
    });
  };

  const filteredTasks = completedTasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const timeFilteredTasks = filterTasksByTime(filteredTasks);

  const groupTasksByDate = (tasks) => {
    const grouped = {};
    
    tasks.forEach(task => {
      if (!task.completedAt) return;
      
      const date = format(parseISO(task.completedAt), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    
    // Sort by date (most recent first)
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    
    return sortedDates.map(date => ({
      date,
      displayDate: format(parseISO(date), 'EEEE, MMMM d, yyyy'),
      tasks: grouped[date].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    }));
  };

  const groupedTasks = groupTasksByDate(timeFilteredTasks);

  const getStatsForFilter = () => {
    const filtered = filterTasksByTime(completedTasks);
    const categories = {};
    
    filtered.forEach(task => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });
    
    return {
      total: filtered.length,
      categories: Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
    };
  };

  const stats = getStatsForFilter();

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader height="h-8" width="w-64" className="mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} height="h-20" />
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
          <ErrorState message={error} onRetry={loadCompletedTasks} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-surface-900">Completed Tasks</h1>
              <p className="text-surface-600 mt-2">
                Review your accomplishments and celebrate your progress
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search completed tasks..."
                className="w-64"
              />
              
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-surface-300 rounded-lg focus:border-primary focus-ring smooth-transition"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-success/10 to-success/20 p-4 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-2">
                <ApperIcon name="CheckCircle2" size={16} className="text-success" />
                <span className="text-sm font-medium text-surface-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-surface-900">{stats.total}</p>
            </motion.div>

            {stats.categories.map(([category, count], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
                className="bg-white border border-surface-200 p-4 rounded-lg"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="primary" size="sm">{category}</Badge>
                </div>
                <p className="text-2xl font-bold text-surface-900">{count}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        {groupedTasks.length === 0 ? (
          <EmptyState
            icon="CheckCircle2"
            title={searchQuery ? 'No matching completed tasks' : 'No completed tasks yet'}
            description={
              searchQuery 
                ? `No completed tasks match "${searchQuery}". Try adjusting your search.`
                : 'Start completing tasks to see your progress here.'
            }
            actionLabel={searchQuery ? 'Clear Search' : 'View All Tasks'}
            onAction={() => {
              if (searchQuery) {
                setSearchQuery('');
              } else {
                window.location.href = '/tasks';
              }
            }}
          />
        ) : (
          <div className="space-y-8">
            {groupedTasks.map(({ date, displayDate, tasks }, groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-lg font-semibold text-surface-900">
                    {displayDate}
                  </h2>
                  <Badge variant="success" size="sm">
                    {tasks.length} tasks
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {tasks.map((task, taskIndex) => (
                    <motion.div
                      key={task.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: taskIndex * 0.05 }}
                    >
                      <TaskCard
                        task={task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedPage;