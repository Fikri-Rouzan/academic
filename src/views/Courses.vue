<script setup>
// Bagian <script setup> tidak ada perubahan dari versi terakhir yang berfungsi
import { ref, watch } from 'vue';
import { supabase } from '../supabase';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const courses = ref([]);
const loading = ref(true);
const errorText = ref('');

async function fetchEnrolledCourses() {
  try {
    if (!authStore.user) return;
    loading.value = true;
    const { data, error } = await supabase.from('enrollments').select(`courses (id, course_name, credits, lecturer_name, class_code, day_of_week, start_time, end_time)`).eq('student_id', authStore.user.id);
    if (error) throw error;
    courses.value = data.map(enrollment => enrollment.courses);
  } catch (err) {
    errorText.value = 'Failed to fetch courses. ' + err.message;
  } finally {
    loading.value = false;
  }
}

watch(() => authStore.user, (newUser) => {
    if (newUser) {
      fetchEnrolledCourses();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-xl border-t-8 border-[#5D4037]">
    <h2 class="text-3xl font-bold mb-6 text-[#5D4037]">Mata Kuliah Saya</h2>
    
    <div v-if="loading" class="text-center py-8">
      <p>Memuat mata kuliah...</p>
    </div>
    <div v-else-if="errorText" class="p-3 text-red-700 bg-red-100 rounded-md">
      <p>{{ errorText }}</p>
    </div>
    <div v-else-if="courses.length === 0" class="text-center py-8">
      <p class="text-gray-600">Anda belum terdaftar di mata kuliah manapun. <br> Silakan hubungi administrator.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="course in courses" :key="course.id" class="p-4 border border-gray-200 rounded-lg bg-slate-50 transition hover:shadow-md hover:-translate-y-1">
        <h3 class="font-bold text-lg text-[#5D4037]">{{ course.course_name }}</h3>
        <p class="text-sm text-gray-600">Dosen: {{ course.lecturer_name }}</p>
        <p class="text-sm text-gray-600">Kelas: {{ course.class_code }}</p>
        <p class="text-sm text-gray-600">SKS: {{ course.credits }}</p>
        <hr class="my-2">
        <p class="font-semibold text-gray-800">{{ course.day_of_week }}, {{ course.start_time }} - {{ course.end_time }}</p>
      </div>
    </div>
  </div>
</template>