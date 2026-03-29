<script setup>
import { ref } from "vue";

const emit = defineEmits(["search"]);
const query = ref("");

function onSearch() {
  emit("search", query.value.trim());
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
</script>

<template>
  <nav class="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
    <h2 class="text-xl font-bold">Recipe App</h2>

    <!-- Search bar -->
    <div class="flex items-center gap-2">
      <input
        v-model="query"
        @keyup.enter="onSearch"
        type="text"
        placeholder="Search recipes..."
        class="px-3 py-1 rounded text-gray-800 w-64"
      />
      <button
        @click="onSearch"
        class="bg-orange-500 px-3 py-1 rounded hover:bg-orange-600"
      >
        Search
      </button>
    </div>

    <div class="space-x-4">
      <router-link to="/">Home</router-link>
      <router-link to="/folders">Folders</router-link>
      <router-link to="/register" class="hover:underline">Register</router-link>
      <button @click="logout" class="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
        Logout
      </button>
    </div>
  </nav>
</template>
