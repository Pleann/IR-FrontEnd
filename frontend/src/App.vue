<script setup>
import { ref, onMounted } from 'vue';
import Navbar from "./components/Navbar.vue";

const message = ref('');

</script>

<template>
  <Navbar />
  <router-view />
</template>