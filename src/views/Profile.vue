<script setup>
// Bagian <script setup> tidak ada perubahan sama sekali dari versi sebelumnya.
import { ref, watch } from 'vue';
import { useAuthStore } from '../store/auth';
import { supabase } from '../supabase';
import Swal from 'sweetalert2';
import {
  UserCircle, KeyRound, Image as ImageIcon, CheckCircle, XCircle,
  Eye, EyeOff
} from 'lucide-vue-next';

const authStore = useAuthStore();
const loading = ref(false);
const uploading = ref(false);
const isEditing = ref(false);

const form = ref({
  full_name: '',
  date_of_birth: '',
  gender: '',
  phone_number: '',
  address: '',
});

const newPassword = ref('');
const confirmPassword = ref('');
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const newAvatarFile = ref(null);
let originalFormState = {};

const showSwal = (title, text, icon) => {
  Swal.fire({
    title, text, icon,
    background: '#fff',
    color: '#343A40',
    confirmButtonColor: '#996f62',
  });
};

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

watch(() => authStore.profile, (newProfile) => {
  if (newProfile) {
    setFormData();
  }
}, {
  immediate: true,
  deep: true,
});

function toggleEditMode() { isEditing.value = true; }
function cancelEdit() {
  form.value = { ...originalFormState };
  newPassword.value = '';
  confirmPassword.value = '';
  isEditing.value = false;
}

async function handleUpdateProfile() {
  if (!authStore.user) return;
  if (newPassword.value) {
    if (newPassword.value.length < 6) { showSwal('Gagal', 'Password baru minimal harus 6 karakter.', 'error'); return; }
    if (newPassword.value !== confirmPassword.value) { showSwal('Gagal', 'Konfirmasi password baru tidak cocok.', 'error'); return; }
  }
  try {
    loading.value = true;
    const profileUpdates = {
      full_name: form.value.full_name,
      date_of_birth: form.value.date_of_birth,
      gender: form.value.gender,
      phone_number: form.value.phone_number,
      address: form.value.address,
    };
    const { error: profileError } = await supabase.from('students').update(profileUpdates).eq('id', authStore.user.id);
    if (profileError) throw profileError;
    if (newPassword.value) {
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword.value });
      if (passwordError) throw passwordError;
    }
    await authStore.fetchUserProfile();
    showSwal('Sukses!', 'Perubahan berhasil disimpan.', 'success');
    newPassword.value = '';
    confirmPassword.value = '';
    isEditing.value = false;
  } catch (error) {
    showSwal('Gagal Menyimpan', error.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function handleAvatarUpload() {
  if (!newAvatarFile.value || !authStore.user) return;
  try {
    uploading.value = true;
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
    showSwal('Sukses!', 'Foto profil berhasil diperbarui.', 'success');
  } catch (error) {
    showSwal('Gagal Mengunggah', error.message, 'error');
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
  <div class="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-xl border-t-8 border-[#5D4037]">
    
    <div class="flex justify-between items-start mb-8">
      <div class="flex items-center gap-4">
        <UserCircle class="text-[#5D4037]" :size="40" :stroke-width="1.5"/>
        <h2 class="text-3xl font-bold text-[#5D4037]">Profil Saya</h2>
      </div>
      <div v-if="!authStore.loading && authStore.profile && !isEditing">
        <button @click="toggleEditMode" class="px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors duration-200 bg-[#996f62] hover:bg-[#8a6154]">
          Ubah Profil
        </button>
      </div>
    </div>

    <div v-if="authStore.loading" class="text-center py-10">
      <p class="text-gray-500">Memuat profil...</p>
    </div>

    <div v-else-if="authStore.profile" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-1 flex flex-col items-center">
        <img 
          :src="authStore.profile.profile_picture_url || 'https://i.pravatar.cc/150?u=' + authStore.user.id" 
          alt="Foto Profil"
          class="w-40 h-40 rounded-full object-cover border-4 border-gray-200 mb-4"
        >
        <label for="avatar-upload" class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors duration-200 bg-[#996f62] hover:bg-[#8a6154]">
          <ImageIcon :size="16"/>
          {{ uploading ? 'Mengunggah...' : 'Ganti Foto' }}
        </label>
        <input id="avatar-upload" type="file" class="hidden" accept="image/png, image/jpeg" @change="onFileSelected" :disabled="uploading">
        <p class="text-xs text-gray-500 mt-2">Pilih file JPG atau PNG.</p>
      </div>

      <div class="lg:col-span-2">
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-gray-500">NIM</label><p class="mt-1 font-semibold text-gray-900">{{ authStore.profile.nim }}</p></div>
              <div>
              <label class="block text-sm font-medium text-gray-500">Email</label>
              <p class="mt-1 font-semibold text-gray-900">{{ authStore.profile.email }}</p>
              </div>
              <div><label class="block text-sm font-medium text-gray-500">Program Studi</label><p class="mt-1 font-semibold text-gray-900">{{ authStore.profile.study_program }}</p></div>
              <div><label class="block text-sm font-medium text-gray-500">Semester</label><p class="mt-1 font-semibold text-gray-900">{{ authStore.profile.semester }}</p></div>
            </div>
            <hr>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label for="fullName" class="block text-sm font-medium text-gray-700">Nama Lengkap</label><input type="text" id="fullName" v-model="form.full_name" :disabled="!isEditing" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" /></div>
              <div><label for="dob" class="block text-sm font-medium text-gray-700">Tanggal Lahir</label><input type="date" id="dob" v-model="form.date_of_birth" :disabled="!isEditing" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" /></div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <input v-if="!isEditing" type="text" :value="form.gender || '-'" disabled class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
                <select v-else id="gender" v-model="form.gender" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                  <option disabled value="">Pilih...</option>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <input type="tel" id="phone" v-model="form.phone_number" :disabled="!isEditing" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" />
              </div>
            </div>

            <div><label for="address" class="block text-sm font-medium text-gray-700">Alamat</label><textarea id="address" v-model="form.address" :disabled="!isEditing" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"></textarea></div>

            <div v-if="isEditing" class="pt-6">
              <hr>
              <div class="flex items-center gap-3 mt-6">
                <KeyRound class="text-[#5D4037]" :size="24" :stroke-width="1.5"/><h3 class="text-lg font-medium leading-6 text-[#5D4037]">Ubah Password (Opsional)</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label for="new-password" class="block text-sm font-medium text-gray-700">Password Baru</label>
                  <div class="relative mt-1">
                    <input :type="showNewPassword ? 'text' : 'password'" id="new-password" v-model="newPassword" class="block w-full border-gray-300 rounded-md shadow-sm pr-10" placeholder="Biarkan kosong jika tidak diubah">
                    <button type="button" @click="showNewPassword = !showNewPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"><EyeOff v-if="!showNewPassword" :size="20" /><Eye v-else :size="20" /></button>
                  </div>
                </div>
                <div>
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                   <div class="relative mt-1">
                    <input :type="showConfirmPassword ? 'text' : 'password'" id="confirm-password" v-model="confirmPassword" class="block w-full border-gray-300 rounded-md shadow-sm pr-10">
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"><EyeOff v-if="!showConfirmPassword" :size="20" /><Eye v-else :size="20" /></button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isEditing" class="pt-6 flex space-x-3">
              <button type="submit" :disabled="loading" class="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 bg-[#996f62] hover:bg-[#8a6154]"><CheckCircle :size="16"/>{{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}</button>
              <button type="button" @click="cancelEdit" class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"><XCircle :size="16"/>Batal</button>
            </div>
        </form>
      </div>
    </div>
    
    <div v-else class="text-center py-10">
      <p class="font-semibold text-red-600">Gagal memuat data profil.</p>
      <p class="text-sm text-gray-500">Silakan coba muat ulang halaman atau hubungi administrator.</p>
    </div>
  </div>
</template>