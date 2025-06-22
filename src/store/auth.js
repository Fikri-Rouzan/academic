// src/store/auth.js

import { defineStore } from 'pinia';
import { supabase } from '../supabase';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const profile = ref(null);
  const session = ref(null);
  const loading = ref(true);

  // Actions
  async function fetchSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      session.value = data.session;
      if (session.value) {
        user.value = session.value.user;
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error fetching session:', error.message);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserProfile() {
    if (!user.value) return;
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
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      return;
    }
    user.value = null;
    profile.value = null;
    session.value = null;
  }

  // Run fetchSession once when the store is initialized
  fetchSession();

  return { user, profile, session, loading, signOut, fetchUserProfile };
});