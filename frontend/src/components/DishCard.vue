<script setup>
defineProps({
  title: String,
});
</script>

<template>
  <div class="card">
    <img src="https://via.placeholder.com/150" />
    <h4>{{ title }}</h4>
  </div>
</template>

<style scoped>
.card {
  width: 180px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

h4 {
  padding: 10px;
}
</style>