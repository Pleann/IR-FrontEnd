<script setup>
defineProps({
  recipe: Object
});

const emit = defineEmits(["close"]);
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white max-w-2xl w-full rounded-xl p-6 overflow-y-auto max-h-[90vh]">

      <!-- Close button -->
      <button
        class="float-right text-gray-500"
        @click="emit('close')"
      >
        close
      </button>

      <!-- Content -->
      <img :src="recipe.images" class="w-full h-60 object-cover rounded mb-4" />

      <h2 class="text-2xl font-bold mb-2">{{ recipe.name }}</h2>

      <p class="text-gray-500 mb-4">{{ recipe.category }}</p>

      <h3 class="font-semibold mt-4">Ingredients</h3>
      <p class="text-sm text-gray-700 mb-4">
        {{ recipe.ingredient_parts }}
      </p>

      <h3 class="font-semibold">Instructions</h3>
      <p class="text-sm text-gray-700 whitespace-pre-line">
        {{ recipe.instructions }}
      </p>

    </div>
  </div>
</template>