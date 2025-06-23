<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import Swal from 'sweetalert2';
import { User, KeyRound, Eye, EyeOff } from 'lucide-vue-next';

// Import dan inisialisasi auth store untuk mengambil profil setelah login
import { useAuthStore } from '../store/auth';
const authStore = useAuthStore();

const router = useRouter();
const nim = ref('');
const password = ref('');
const errorMessage = ref(null);
const loading = ref(false);
const isPasswordVisible = ref(false);

async function handleLogin() {
  try {
    loading.value = true;
    errorMessage.value = null;

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('email, full_name')
      .eq('nim', nim.value.trim())
      .single();

    if (studentError || !studentData) {
      throw new Error('NIM tidak ditemukan. Silakan periksa kembali NIM Anda.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: studentData.email,
      password: password.value,
    });

    if (error) {
      throw new Error('Password yang Anda masukkan salah.');
    }

    // Ambil data profil dan tunggu sampai selesai sebelum pindah halaman
    await authStore.fetchUserProfile();
    
    // --- PERBAIKAN UTAMA: Notifikasi dan Navigasi dipisahkan ---

    // 1. Tampilkan notifikasi toast (tidak memblokir)
    Swal.fire({
      toast: true,
      position: "top-end",
      title: `Selamat datang, ${studentData.full_name}!`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
      background: '#fff',
      color: '#343A40',
      didOpen: (toast) => {
        const progressBar = Swal.getTimerProgressBar();
        if (progressBar) {
          progressBar.style.backgroundColor = '#5D4037';
        }
      }
    });

    // 2. Langsung arahkan pengguna ke halaman Beranda
    router.push({ name: 'Beranda' });

  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-slate-50">
    <div class="absolute inset-0 z-0 pointer-events-none">
      <GraduationCap class="absolute -top-4 -left-12 text-slate-200 opacity-70" :size="160" :stroke-width="1" />
      <BookOpen class="absolute top-1/2 -right-16 text-slate-200 opacity-60 transform -rotate-12" :size="200" :stroke-width="1" />
      <FlaskConical class="absolute -bottom-16 left-1/4 text-slate-200 opacity-50 transform rotate-12" :size="180" :stroke-width="1" />
      <Calculator class="absolute top-16 right-1/4 text-slate-200 opacity-60 transform rotate-6" :size="120" :stroke-width="1" />
    </div>
    <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-sm p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <div class="text-center">
          <h2 class="text-4xl font-bold text-[#5D4037]">
            Sistem Akademik
          </h2>
          <p class="mt-2 text-gray-600">
            Silakan masuk ke akun Anda
          </p>
        </div>
        <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
          <div>
            <label for="nim" class="block text-sm font-medium text-gray-700">NIM</label>
            <div class="relative mt-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User :size="20" />
              </span>
              <input
                id="nim"
                type="text"
                v-model="nim"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#996f62] focus:border-[#996f62] pl-10"
                placeholder="Masukkan NIM Anda"
              />
            </div>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Kata Sandi</label>
            <div class="relative mt-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound :size="20" />
              </span>
              <input
                id="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                v-model="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#996f62] focus:border-[#996f62] pl-10 pr-10"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                @click="isPasswordVisible = !isPasswordVisible" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <EyeOff v-if="!isPasswordVisible" :size="20" />
                <Eye v-else :size="20" />
              </button>
            </div>
          </div>
          <div v-if="errorMessage" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {{ errorMessage }}
          </div>
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-opacity-60 bg-[#996f62] hover:bg-[#8a6154] focus:ring-[#8a6154]"
            >
              {{ loading ? 'Memproses...' : 'Masuk' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>