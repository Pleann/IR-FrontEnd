<script setup>
import { ref, onMounted, provide } from 'vue';
import Navbar from "./components/Navbar.vue";

const message = ref('');

const searchQuery = ref("");

function handleSearch(query) {
  console.log("App.vue received search:", query);
  searchQuery.value = query;
}
provide("searchQuery", searchQuery);

</script>

<template>
  <Navbar @search="handleSearch" />
  <router-view :searchQuery="searchQuery" />
</template>