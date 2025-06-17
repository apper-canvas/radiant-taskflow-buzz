import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Checkbox from '@/components/atoms/Checkbox';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { taskService } from '@/services';

const TaskCard = ({ task, onUpdate, onDelete, onEdit }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleToggleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      const updatedTask = await taskService.update(task.Id, {
        completed: !task.completed
      });
      
      if (onUpdate) {
        onUpdate(updatedTask);
      }
      
      toast.success(
        updatedTask.completed 
          ? '🎉 Task completed!' 
          : 'Task marked as incomplete'
      );
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await taskService.delete(task.Id);
      
      if (onDelete) {
        onDelete(task.Id);
      }
      
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD93D';
      case 'low': return '#4ECDC4';
      default: return '#94a3b8';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return { text: 'Today', urgent: true };
    }
    
    if (isPast(date)) {
      return { text: 'Overdue', urgent: true, overdue: true };
    }
    
    return { text: format(date, 'MMM d'), urgent: false };
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      className={`
        bg-white rounded-lg border border-surface-200 p-4 smooth-transition cursor-pointer
        ${task.completed ? 'opacity-60' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            onChange={handleToggleComplete}
            disabled={isCompleting}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-medium break-words
                ${task.completed 
                  ? 'text-surface-500 line-through' 
                  : 'text-surface-900'
                }
              `}>
                {task.title}
              </h3>
              
              <div className="flex items-center space-x-3 mt-2">
                {/* Priority Badge */}
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <Badge variant={task.priority} size="sm">
                    {task.priority}
                  </Badge>
                </div>

                {/* Category */}
                <Badge variant="default" size="sm">
                  {task.category}
                </Badge>

                {/* Due Date */}
                {dueDateInfo && (
                  <div className={`
                    flex items-center space-x-1 text-sm
                    ${dueDateInfo.overdue 
                      ? 'text-error' 
                      : dueDateInfo.urgent 
                        ? 'text-warning' 
                        : 'text-surface-500'
                    }
                  `}>
                    <ApperIcon 
                      name="Calendar" 
                      size={14} 
                      className={
                        dueDateInfo.overdue 
                          ? 'text-error' 
                          : dueDateInfo.urgent 
                            ? 'text-warning' 
                            : 'text-surface-400'
                      }
                    />
                    <span className="font-medium">{dueDateInfo.text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1 ml-3"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit && onEdit(task)}
                    className="p-1 w-8 h-8"
                  >
                    <ApperIcon name="Edit2" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    loading={isDeleting}
                    className="p-1 w-8 h-8 text-error hover:bg-error/10"
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Completion Animation */}
      <AnimatePresence>
        {task.completed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-success"
            >
              <ApperIcon name="CheckCircle2" size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;