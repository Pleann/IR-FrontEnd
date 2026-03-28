<script setup>
import Navbar from "../components/Navbar.vue";
</script>

<template>
  <Navbar />
  <main class="container">
    <slot />
  </main>
</template>

<style scoped>
.container {
  padding: 20px;
}
</style>