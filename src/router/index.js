// src/router/index.js (Versi Baru)

import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../supabase';

// Import views
import Login from '../views/Login.vue';
import DashboardLayout from '../views/DashboardLayout.vue';
import Profile from '../views/Profile.vue';
import Courses from '../views/Courses.vue';
import Beranda from '../views/Beranda.vue'; // <-- 1. IMPORT HALAMAN BERANDA

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
    children: [
      { path: '', redirect: '/beranda' }, // <-- 2. UBAH REDIRECT KE BERANDA
      { path: '/beranda', name: 'Beranda', component: Beranda, meta: { requiresAuth: true } }, // <-- 3. TAMBAHKAN ROUTE BERANDA
      { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
      { path: '/courses', name: 'Courses', component: Courses, meta: { requiresAuth: true } },
    ],
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !session) {
    next({ name: 'Login' });
  } 
  else if (!requiresAuth && session) {
    // 4. UBAH REDIRECT JIKA SUDAH LOGIN, AGAR MENUJU BERANDA
    next({ name: 'Beranda' }); 
  }
  else {
    next();
  }
});

export default router;