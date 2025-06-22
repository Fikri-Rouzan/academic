<script setup>
// Script ini sudah benar, hanya perlu mengimpor Header.
import Header from '../components/Header.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Header />
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
  </div>
</template>