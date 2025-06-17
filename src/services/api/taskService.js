import tasksData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tasks = [...tasksData];

const taskService = {
  async getAll() {
    await delay(200);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id, 10));
    return task ? { ...task } : null;
  },

  async create(taskData) {
    await delay(300);
    const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id), 0) + 1,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updates) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[index],
      ...updates,
      Id: tasks[index].Id, // Prevent ID modification
      completedAt: updates.completed && !tasks[index].completed 
        ? new Date().toISOString() 
        : (!updates.completed ? null : tasks[index].completedAt)
    };
    
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async delete(id) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = { ...tasks[index] };
    tasks.splice(index, 1);
    return deletedTask;
  },

  async bulkDelete(ids) {
    await delay(400);
    const deletedTasks = [];
    const idsToDelete = ids.map(id => parseInt(id, 10));
    
    tasks = tasks.filter(task => {
      if (idsToDelete.includes(task.Id)) {
        deletedTasks.push({ ...task });
        return false;
      }
      return true;
    });
    
    return deletedTasks;
  },

  async getByCategory(category) {
    await delay(200);
    return tasks.filter(task => task.category === category).map(task => ({ ...task }));
  },

  async search(query) {
    await delay(250);
    const searchTerm = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.category.toLowerCase().includes(searchTerm)
    ).map(task => ({ ...task }));
  },

  async reorder(taskId, newPosition) {
    await delay(300);
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId, 10));
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const [movedTask] = tasks.splice(taskIndex, 1);
    tasks.splice(newPosition, 0, movedTask);
    
    return [...tasks];
  }
};

export default taskService;