<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../store/auth';
import { supabase } from '../supabase';

const authStore = useAuthStore();
const loading = ref(false);
const uploading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const newAvatarFile = ref(null);
const isEditing = ref(false);

// State untuk form profil
const form = ref({
  full_name: '',
  date_of_birth: '',
  gender: '',
  phone_number: '',
  address: '',
});

// State untuk form ganti password
const newPassword = ref('');
const confirmPassword = ref('');

// --- BAGIAN BARU: State untuk kontrol show/hide password ---
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

let originalFormState = {};

function setFormData() {
  if (authStore.profile) {
    const profileData = {
      full_name: authStore.profile.full_name,
      date_of_birth: authStore.profile.date_of_birth,
      gender: authStore.profile.gender,
      phone_number: authStore.profile.phone_number,
      address: authStore.profile.address,
    };
    form.value = { ...profileData };
    originalFormState = { ...profileData };
  }
}

onMounted(setFormData);
watch(() => authStore.profile, setFormData, { deep: true });

function toggleEditMode() {
  isEditing.value = true;
}

function cancelEdit() {
  form.value = { ...originalFormState };
  newPassword.value = ''; // Reset password fields on cancel
  confirmPassword.value = '';
  isEditing.value = false;
  errorMessage.value = '';
  successMessage.value = '';
}

// --- FUNGSI UTAMA YANG DIMODIFIKASI: Menyimpan profil dan password (jika diisi) ---
async function handleUpdateProfile() {
  if (!authStore.user) {
    errorMessage.value = 'You are not logged in!';
    return;
  }

  // --- Logika BARU: Validasi password jika diisi ---
  if (newPassword.value) {
    if (newPassword.value.length < 6) {
      errorMessage.value = "New password must be at least 6 characters.";
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      errorMessage.value = "Passwords do not match.";
      return;
    }
  }

  try {
    loading.value = true;
    successMessage.value = '';
    errorMessage.value = '';
    
    // 1. Update data profil teks
    const profileUpdates = {
      full_name: form.value.full_name, date_of_birth: form.value.date_of_birth,
      gender: form.value.gender, phone_number: form.value.phone_number, address: form.value.address,
    };
    const { error: profileError } = await supabase.from('students').update(profileUpdates).eq('id', authStore.user.id);
    if (profileError) throw profileError;

    // 2. Update password HANYA JIKA kolom password baru diisi
    if (newPassword.value) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword.value
      });
      if (passwordError) throw passwordError;
    }
    
    await authStore.fetchUserProfile();
    successMessage.value = 'Profile updated successfully!';
    newPassword.value = ''; // Clear password fields after successful save
    confirmPassword.value = '';
    isEditing.value = false;

  } catch (error) {
    errorMessage.value = 'Error updating profile: ' + error.message;
  } finally {
    loading.value = false;
  }
}

// (Fungsi upload avatar tidak berubah)
async function handleAvatarUpload() {
    if (!newAvatarFile.value || !authStore.user) return;
    try {
        uploading.value = true;
        successMessage.value = '';
        errorMessage.value = '';
        const file = newAvatarFile.value;
        const fileExt = file.name.split('.').pop();
        const fileName = `${authStore.user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        const publicURL = urlData.publicUrl;
        const { error: updateError } = await supabase.from('students').update({ profile_picture_url: publicURL }).eq('id', authStore.user.id);
        if (updateError) throw updateError;
        await authStore.fetchUserProfile();
        successMessage.value = 'Profile picture updated successfully!';
    } catch (error) {
        errorMessage.value = 'Error uploading avatar: ' + error.message;
    } finally {
        uploading.value = false;
        newAvatarFile.value = null;
    }
}
function onFileSelected(event) {
  const files = event.target.files;
  if (files.length > 0) {
    newAvatarFile.value = files[0];
    handleAvatarUpload();
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-2xl font-bold text-gray-800">My Profile</h2>
      <div v-if="!isEditing">
        <button @click="toggleEditMode" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          Edit Profile
        </button>
      </div>
    </div>

    <div v-if="successMessage" class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
      {{ errorMessage }}
    </div>

    <div v-if="!authStore.profile" class="text-center py-8">
      <p>Loading profile...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-1 flex flex-col items-center">
        <img 
          :src="authStore.profile.profile_picture_url || 'https://i.pravatar.cc/150?u=' + authStore.user.id" 
          alt="Profile Picture"
          class="w-40 h-40 rounded-full object-cover border-4 border-gray-200 mb-4"
        >
        <label for="avatar-upload" class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
          {{ uploading ? 'Uploading...' : 'Change Picture' }}
        </label>
        <input 
          id="avatar-upload"
          type="file" 
          class="hidden"
          accept="image/png, image/jpeg"
          @change="onFileSelected"
          :disabled="uploading"
        >
        <p class="text-xs text-gray-500 mt-2">Pilih file JPG atau PNG.</p>
      </div>

      <div class="md:col-span-2">
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-500">NIM</label><p class="mt-1 text-lg font-semibold text-gray-900">{{ authStore.profile.nim }}</p></div>
            <div><label class="block text-sm font-medium text-gray-500">Email</label><p class="mt-1 text-lg text-gray-900">{{ authStore.profile.email }}</p></div>
            <hr>
            <div><label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label><input type="text" id="fullName" v-model="form.full_name" :disabled="!isEditing" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" /></div>
            <div><label for="dob" class="block text-sm font-medium text-gray-700">Date of Birth</label><input type="date" id="dob" v-model="form.date_of_birth" :disabled="!isEditing" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" /></div>
            <div><label for="gender" class="block text-sm font-medium text-gray-700">Gender</label><select id="gender" v-model="form.gender" :disabled="!isEditing" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"><option>Laki-laki</option><option>Perempuan</option></select></div>
            <div><label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label><input type="tel" id="phone" v-model="form.phone_number" :disabled="!isEditing" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" /></div>
            <div><label for="address" class="block text-sm font-medium text-gray-700">Address</label><textarea id="address" v-model="form.address" :disabled="!isEditing" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"></textarea></div>

            <div v-if="isEditing" class="pt-6">
              <hr>
              <h3 class="text-lg font-medium leading-6 text-gray-900 mt-6">Change Password (Optional)</h3>
                <div class="mt-4">
                  <label for="new-password" class="block text-sm font-medium text-gray-700">New Password</label>
                  <div class="relative mt-1">
                    <input :type="showNewPassword ? 'text' : 'password'" id="new-password" v-model="newPassword" class="block w-full border-gray-300 rounded-md shadow-sm pr-10" placeholder="Leave blank to keep current password">
                    <button type="button" @click="showNewPassword = !showNewPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                      <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.458 10C1.73 5.943 5.522 3 10 3s8.27 2.943 9.542 7c-1.272 4.057-5.022 7-9.542 7S1.73 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.5 2.5 0 01-3.536 3.536l-1.514-1.515A4.006 4.006 0 0110 6c.51 0 1 .093 1.465.268zm2.969 2.969a2.5 2.5 0 00-3.536-3.536L6.293 6.293A4.006 4.006 0 0010 14c.51 0 1-.093 1.465-.268zM10 17c4.478 0 8.27-2.943 9.542-7 .943-3.013-1.016-5.74-3.54-6.851l-1.414-1.415A12.01 12.01 0 0110 1c-4.97 0-9.268 3.368-10.785 8.04A12.015 12.015 0 015.46 15.85l1.414 1.414A10.014 10.014 0 0110 17z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
                <div class="mt-4">
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                   <div class="relative mt-1">
                    <input :type="showConfirmPassword ? 'text' : 'password'" id="confirm-password" v-model="confirmPassword" class="block w-full border-gray-300 rounded-md shadow-sm pr-10">
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                      <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.458 10C1.73 5.943 5.522 3 10 3s8.27 2.943 9.542 7c-1.272 4.057-5.022 7-9.542 7S1.73 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.5 2.5 0 01-3.536 3.536l-1.514-1.515A4.006 4.006 0 0110 6c.51 0 1 .093 1.465.268zm2.969 2.969a2.5 2.5 0 00-3.536-3.536L6.293 6.293A4.006 4.006 0 0010 14c.51 0 1-.093 1.465-.268zM10 17c4.478 0 8.27-2.943 9.542-7 .943-3.013-1.016-5.74-3.54-6.851l-1.414-1.415A12.01 12.01 0 0110 1c-4.97 0-9.268 3.368-10.785 8.04A12.015 12.015 0 015.46 15.85l1.414 1.414A10.014 10.014 0 0110 17z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
            </div>

            <div v-if="isEditing" class="pt-4 flex space-x-3">
              <button type="submit" :disabled="loading" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
              <button type="button" @click="cancelEdit" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Cancel
              </button>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>