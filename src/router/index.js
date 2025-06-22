// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../supabase';

// Import views
import Login from '../views/Login.vue';
import DashboardLayout from '../views/DashboardLayout.vue';
import Profile from '../views/Profile.vue';
import Courses from '../views/Courses.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    name: 'DashboardLayout',
    component: DashboardLayout,
    // Nested routes. These will be displayed inside DashboardLayout
    children: [
      { path: '', redirect: '/profile' }, // Default child route
      { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
      { path: '/courses', name: 'Courses', component: Courses, meta: { requiresAuth: true } },
    ],
    meta: { requiresAuth: true } // This entire group requires login
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
// This runs before each navigation
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // If the route requires authentication and there is no user session
  if (requiresAuth && !session) {
    // Redirect to the login page
    next({ name: 'Login' });
  } 
  // If the user is logged in and tries to access the login page
  else if (!requiresAuth && session) {
    // Redirect to their profile
    next({ name: 'Profile' });
  }
  else {
    // Otherwise, allow navigation
    next();
  }
});


export default router;