<script setup>
import MainLayout from "../layouts/MainLayout.vue";
import DishCard from "../components/DishCard.vue";
</script>

<template>
  <MainLayout>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg">
    <h3 class="font-semibold text-lg">📁 Your Folders</h3>
  </div>

  <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg">
    <h3 class="font-semibold text-lg">⭐ Top Rated</h3>
  </div>

  <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg">
    <h3 class="font-semibold text-lg">🎲 Random</h3>
  </div>
</div>
  </MainLayout>
</template>
