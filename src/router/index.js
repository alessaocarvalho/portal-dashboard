import { createRouter, createWebHistory } from 'vue-router';
import ProductionDashboard from '../views/ProductionDashboard.vue';

const routes = [
  {
    path: '/dashboard',
    name: 'ProductionDashboard',
    component: ProductionDashboard,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;