// src/supabase.js

import { createClient } from '@supabase/supabase-js'

// =======================================================
// BAGIAN DEBUGGING: Untuk memastikan .env.local terbaca
console.log("Supabase URL Loaded:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Anon Key Loaded:", import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No');
// =======================================================

// -------------------------------------------------------
// SISA KODE YANG HILANG (BAGIAN UTAMA)
// -------------------------------------------------------

// 1. Ambil URL dan Key dari variabel yang sudah di-load
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. Buat Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 3. Export client agar bisa di-import oleh file lain (seperti Login.vue)
// Baris inilah yang akan memperbaiki error Anda saat ini.
export { supabase }