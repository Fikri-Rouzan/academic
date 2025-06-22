<script setup>
import { ref, watch } from 'vue'; // Ganti onMounted dengan watch
import { supabase } from '../supabase';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const courses = ref([]);
const loading = ref(true);
const errorText = ref('');

async function fetchEnrolledCourses() {
  // Fungsi ini tidak perlu diubah isinya
  try {
    if (!authStore.user) return;

    loading.value = true; // Set loading ke true saat mulai fetch
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        courses (
          id, course_name, credits, lecturer_name, 
          class_code, day_of_week, start_time, end_time
        )
      `)
      .eq('student_id', authStore.user.id);

    if (error) throw error;
    
    courses.value = data.map(enrollment => enrollment.courses);

  } catch (err) {
    errorText.value = 'Failed to fetch courses. ' + err.message;
  } finally {
    loading.value = false;
  }
}

// --- BAGIAN YANG DIPERBARUI ---
// Kita tidak lagi menggunakan onMounted.
// Kita menggunakan 'watch' untuk mengamati perubahan pada authStore.user.

watch(
  () => authStore.user, // 1. Sumber data yang diamati
  (newUser) => {         // 2. Fungsi yang dijalankan saat ada perubahan
    if (newUser) {
      // Jika newUser tidak lagi null (artinya data user sudah didapatkan),
      // barulah kita panggil fungsi untuk mengambil mata kuliah.
      fetchEnrolledCourses();
    }
  },
  { immediate: true }  // 3. Opsi agar fungsi ini dijalankan langsung saat komponen dimuat
);
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">My Enrolled Courses</h2>
    
    <div v-if="loading" class="text-center py-8">
      <p>Loading your courses...</p>
    </div>
    <div v-else-if="errorText" class="p-3 text-red-700 bg-red-100 rounded-md">
      <p>{{ errorText }}</p>
    </div>
    <div v-else-if="courses.length === 0" class="text-center py-8">
      <p class="text-gray-600">You are not enrolled in any courses yet. <br> Please contact your administrator.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="course in courses" :key="course.id" class="p-4 border border-gray-200 rounded-lg bg-gray-50 transition hover:shadow-md">
        <h3 class="font-bold text-lg text-indigo-700">{{ course.course_name }}</h3>
        <p class="text-sm text-gray-600">Lecturer: {{ course.lecturer_name }}</p>
        <p class="text-sm text-gray-600">Class: {{ course.class_code }}</p>
        <p class="text-sm text-gray-600">Credits: {{ course.credits }} SKS</p>
        <hr class="my-2">
        <p class="font-semibold text-gray-800">{{ course.day_of_week }}, {{ course.start_time }} - {{ course.end_time }}</p>
      </div>
    </div>
  </div>
</template>