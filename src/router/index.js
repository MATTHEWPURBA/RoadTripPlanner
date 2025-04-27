import { createRouter, createWebHistory } from 'vue-router';

// Import views
import HomePage from '../views/HomePage.vue';
import TripPlannerPage from '../views/TripPlannerPage.vue';
import TripDetailsPage from '../views/TripDetailsPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { title: 'Road Trip Planner - Home' }
  },
  {
    path: '/trip/new',
    name: 'NewTrip',
    component: TripPlannerPage,
    meta: { title: 'Plan a New Trip' }
  },
  {
    path: '/trip/:id',
    name: 'TripDetails',
    component: TripDetailsPage,
    props: true,
    meta: { title: 'Trip Details' }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Update page title based on route meta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Road Trip Planner';
  next();
});

export default router;