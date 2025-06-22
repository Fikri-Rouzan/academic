<script setup>
import Header from '../components/Header.vue';
// Import ikon untuk dekorasi
import { GraduationCap, BookOpen, FlaskConical, Calculator } from 'lucide-vue-next';
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-slate-100">

    <div class="absolute inset-0 z-0 pointer-events-none">
      <GraduationCap class="absolute top-20 -left-12 text-slate-200" :size="160" :stroke-width="1" />
      <BookOpen class="absolute bottom-40 -right-16 text-slate-200 transform -rotate-12" :size="200" :stroke-width="1" />
      <FlaskConical class="absolute -bottom-16 left-1/4 text-slate-200 transform rotate-12" :size="180" :stroke-width="1" />
      <Calculator class="absolute top-24 right-1/4 text-slate-200 transform rotate-6" :size="120" :stroke-width="1" />
    </div>

    <div class="relative z-10">
      <Header />
      <main>
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <router-view />
        </div>
      </main>
    </div>

  </div>
</template>