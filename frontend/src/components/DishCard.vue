<script setup>
defineProps({
  title: String,
  image: String,
  description: String,
  category: String,
  recipe: Object,
});

const emit = defineEmits(["select"])

</script>

<template>
    <div
    @click="emit('select', recipe)"
    class="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
    >
  <div class="bg-white rounded-xl shadow hover:shadow-lg transition">
    <img
      :src="image"
      class="w-full h-40 object-cover"
    />
    <div class="p-3">
      <h3 class="font-semibold text-lg">{{ title }}</h3>
      <p class="text-sm text-gray-500">{{ category }}</p>
      <p class="text-sm text-gray-600 line-clamp-2">
        {{ description }}
      </p>
    </div>
  </div>
</div>
</template>