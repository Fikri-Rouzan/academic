<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { Menu, X } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isMobileMenuOpen = ref(false);

watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

// --- FUNGSI LOGOUT YANG DIPERBARUI ---
async function handleLogout() {
  Swal.fire({
    title: 'Konfirmasi Keluar',
    text: "Apakah Anda yakin ingin keluar dari sesi ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Tidak, Batalkan',
    confirmButtonColor: '#996f62',
    cancelButtonColor: '#6c757d',
    background: '#fff',
    color: '#343A40'
  }).then(async (result) => {
    // Jika pengguna mengklik tombol "Ya, Keluar"
    if (result.isConfirmed) {
      // Lakukan proses sign out
      await authStore.signOut();
      
      // Arahkan ke halaman login
      router.push({ name: 'Login' });
      
      // Tampilkan notifikasi toast bahwa logout berhasil
      Swal.fire({
        toast: true,
        position: "top-end",
        title: 'Anda Telah Keluar',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: '#fff',
        color: '#343A40',
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
          const progressBar = Swal.getTimerProgressBar();
          if (progressBar) {
            progressBar.style.backgroundColor = '#5D4037';
          }
        }
      });
    }
  });
}
</script>

<template>
  <nav class="bg-[#5D4037] shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <div class="flex-shrink-0">
          <span class="text-white text-xl font-bold">Sistem Akademik</span>
        </div>

        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <router-link
              to="/beranda"
              class="text-white bg-[#996f62] hover:bg-[#8a6154] px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              active-class="bg-[#8a6154] ring-2 ring-white"
            >
              Beranda
            </router-link>
            <router-link
              to="/profile"
              class="text-white bg-[#996f62] hover:bg-[#8a6154] px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              active-class="bg-[#8a6154] ring-2 ring-white"
            >
              Profil
            </router-link>
            <router-link
              to="/courses"
              class="text-white bg-[#996f62] hover:bg-[#8a6154] px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              active-class="bg-[#8a6154] ring-2 ring-white"
            >
              Mata Kuliah
            </router-link>
            <button
              @click="handleLogout"
              class="text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            >
              Keluar
            </button>
          </div>
        </div>

        <div class="-mr-2 flex md:hidden">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" type="button" class="bg-[#996f62] inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#8a6154] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#5D4037] focus:ring-white">
            <span class="sr-only">Buka menu utama</span>
            <X v-if="isMobileMenuOpen" class="block h-6 w-6" />
            <Menu v-else class="block h-6 w-6" />
          </button>
        </div>

      </div>
    </div>

    <div v-if="isMobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link
          to="/beranda"
          class="text-gray-200 hover:bg-[#8a6154] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          active-class="bg-[#8a6154] text-white"
        >
          Beranda
        </router-link>
        <router-link
          to="/profile"
          class="text-gray-200 hover:bg-[#8a6154] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          active-class="bg-[#8a6154] text-white"
        >
          Profil
        </router-link>
        <router-link
          to="/courses"
          class="text-gray-200 hover:bg-[#8a6154] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          active-class="bg-[#8a6154] text-white"
        >
          Mata Kuliah
        </router-link>
        <button
          @click="handleLogout"
          class="w-full text-left text-white bg-red-600 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium"
        >
          Keluar
        </button>
      </div>
    </div>
  </nav>
</template>