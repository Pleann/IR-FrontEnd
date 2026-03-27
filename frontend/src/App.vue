<script setup>
import { ref, onMounted } from 'vue';
import { fetchTest } from './services/api';

const message = ref('');

onMounted(async () => {
  const data = await fetchTest();
  message.value = data.message;
});
</script>

<template>
  <h1>{{ message }}</h1>
</template>