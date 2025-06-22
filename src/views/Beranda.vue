<script setup>
import { useAuthStore } from '../store/auth';
import { Award } from 'lucide-vue-next';

const authStore = useAuthStore();
</script>

<template>
  <div class="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-xl border-t-8 border-[#5D4037]">
    
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <div class="flex-1">
        <div class="flex items-center gap-4">
          <Award class="text-[#5D4037]" :size="40" :stroke-width="1.5" />
          <div>
            <h2 class="text-3xl font-bold text-[#5D4037]">
              Selamat Datang!
            </h2>
            <p v-if="authStore.profile" class="text-gray-600 text-lg">
              Halo, {{ authStore.profile.full_name }}
            </p>
            <p v-else class="text-gray-600 text-lg">
              Senang melihat Anda kembali.
            </p>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-6" />

    <!-- Gambar di kiri, teks di kanan -->
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
      
      <!-- Gambar di kiri, ukuran lebih kecil -->
      <img 
        src="/Head.png" 
        alt="Ilustrasi Akademik"
        class="w-52 h-auto rounded-lg shadow-md object-cover"
      />

      <!-- Teks di kanan, rata kiri dan lebar penuh -->
        <div class="text-gray-700 text-base text-left w-full">
        <p class="mb-4">
           Selamat datang di halaman utama dari Sistem Akademik. Anda dapat melihat informasi profil dan daftar mata kuliah yang Anda ambil melalui menu navigasi di atas.
        </p>
        <p>
            Pastikan semua informasi yang tertera sudah sesuai. Jika terdapat kesalahan atau Anda mengalami kendala dalam penggunaan sistem, silakan hubungi bagian administrasi akademik untuk bantuan lebih lanjut.
        </p>
        </div>

    </div>

  </div>
</template>
