// src/store/auth.js (Versi Final yang Reaktif)

import { defineStore } from 'pinia';
import { supabase } from '../supabase';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const profile = ref(null);
  const session = ref(null);
  const loading = ref(true); // Untuk loading awal

  /**
   * Mengambil data profil dari tabel 'students' berdasarkan ID user yang login.
   */
  async function fetchUserProfile() {
    if (!user.value) {
      profile.value = null;
      return;
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.value.id)
        .single();
      
      if (error) throw error;
      profile.value = data;
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      profile.value = null;
    }
  }

  /**
   * Melakukan proses sign out.
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    // `onAuthStateChange` akan secara otomatis mengosongkan state
  }

  // ==================================================================
  // INI ADALAH JANTUNG DARI SOLUSI KITA
  // Listener ini akan berjalan setiap kali ada perubahan status otentikasi
  // (saat membuka aplikasi, login, dan logout)
  // ==================================================================
  supabase.auth.onAuthStateChange(async (event, newSession) => {
    console.log("AUTH STATE CHANGED:", event); // Log untuk debugging
    loading.value = true;
    
    user.value = newSession?.user ?? null;
    session.value = newSession;

    // Jika ada user (setelah login atau sesi ada), ambil profilnya
    if (user.value) {
      await fetchUserProfile();
    } else {
      // Jika tidak ada user (setelah logout), kosongkan profil
      profile.value = null;
    }
    
    // Selesaikan loading setelah semua proses selesai
    loading.value = false;
  });


  // Kembalikan semua state dan fungsi agar bisa digunakan di komponen lain
  return { user, profile, session, loading, signOut, fetchUserProfile };
});