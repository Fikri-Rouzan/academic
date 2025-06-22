<script setup>
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router'; // <-- 1. IMPORT useRouter

const authStore = useAuthStore();
const router = useRouter(); // <-- 2. INISIALISASI router

async function handleLogout() {
  // Panggil fungsi signOut seperti biasa
  await authStore.signOut();
  
  // 3. SECARA EKSPLISIT arahkan ke halaman Login setelah selesai
  router.push({ name: 'Login' });
}
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <span class="font-bold text-xl text-indigo-600">Akademik</span>
        </div>
        
        <div class="flex items-center space-x-4">
          <router-link
            to="/profile"
            class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            active-class="bg-gray-200 text-gray-900"
          >
            Profile
          </router-link>
          <router-link
            to="/courses"
            class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            active-class="bg-gray-200 text-gray-900"
          >
            My Courses
          </router-link>
          
          <button
            @click="handleLogout"
            class="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>