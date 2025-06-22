<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();
const nim = ref('');
const password = ref('');
const errorMessage = ref(null);
const loading = ref(false);

const isPasswordVisible = ref(false);

// Function to handle the login process
async function handleLogin() {
  try {
    loading.value = true;
    errorMessage.value = null;

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('email')
      .eq('nim', nim.value.trim())
      .single();

    if (studentError || !studentData) {
      throw new Error('NIM not found. Please check your NIM and try again.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: studentData.email,
      password: password.value,
    });

    if (error) throw error;

    router.push({ name: 'Profile' });

  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-800">Sistem Akademik</h2>
      <p class="text-center text-gray-600">Please sign in to your account</p>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="nim" class="block text-sm font-medium text-gray-700">NIM (Student ID)</label>
          <input
            id="nim"
            type="text"
            v-model="nim"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your NIM"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="relative mt-1">
            <input
              id="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              v-model="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              placeholder="••••••••"
            />
            <button 
              type="button" 
              @click="isPasswordVisible = !isPasswordVisible" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg v-if="!isPasswordVisible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path fill-rule="evenodd" d="M.458 10C1.73 5.943 5.522 3 10 3s8.27 2.943 9.542 7c-1.272 4.057-5.022 7-9.542 7S1.73 14.057.458 10ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.243c-1.28-4.01-5.09-6.94-9.5-6.94a9.965 9.965 0 0 0-4.42 1.057L3.28 2.22ZM7.75 9.25a2.25 2.25 0 0 0 2.25 2.25c.39 0 .74-.1.05-.27l-2.525-2.525c.17-.3-.02-.66-.27-.05Zm1.39-3.855a2.252 2.252 0 0 1 2.25 2.25c0 .39-.1.74-.27.05l-2.525-2.525c.3-.17.66-.02.05-.27ZM10 5a9.965 9.965 0 0 1 4.42 1.057l1.745-1.745a.75.75 0 1 0-1.06-1.06L3.28 17.78a.75.75 0 0 0 1.06 1.06l1.745-1.745A10.029 10.029 0 0 1 5.5 15c1.28 4.01 5.09 6.94 9.5 6.94a9.965 9.965 0 0 1 4.42-1.057l-1.745-1.tfa.75.75 0 1 0-1.06-1.06L10.53 9.47l-.92-1.15a2.252 2.252 0 0 0-2.25-2.25Z" clip-rule="evenodd" />
              </svg>
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
            class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>