import TasksPage from '@/components/pages/TasksPage';
import CategoriesPage from '@/components/pages/CategoriesPage';
import CompletedPage from '@/components/pages/CompletedPage';

export const routes = {
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: TasksPage
  },
  categories: {
    id: 'categories',
    label: 'Categories',
    path: '/categories',
    icon: 'Tag',
    component: CategoriesPage
  },
  completed: {
    id: 'completed',
    label: 'Completed',
    path: '/completed',
    icon: 'CheckCircle2',
    component: CompletedPage
  }
};

export const routeArray = Object.values(routes);
export default routes;