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
  <nav style="background: #2C1810; font-family: 'Georgia', serif;" class="px-8 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-6">

      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 no-underline">
        <span style="color: #F5A623; font-size: 1.25rem; font-weight: 700; letter-spacing: 5em; letter-spacing: 0.15em">
          RECIPE
        </span>
      </router-link>

      <!-- Search bar -->
      <div class="flex items-center gap-2 flex-1 max-w-md">
        <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded-full"
          style="background: rgba(255,255,255,0.08); border: 1px solid rgba(245,166,35,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="#F5A623" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
          <input v-model="query" @keyup.enter="onSearch" type="text"
            placeholder="Search recipes..."
            style="background: transparent; color: #F5F0E8; font-size: 0.9rem; outline: none; border: none; width: 100%;"
            class="placeholder-gray-400" />
        </div>
        <button @click="onSearch"
          style="background: #F5A623; color: #2C1810; font-weight: 600; font-size: 0.85rem; padding: 0.5rem 1.25rem; border-radius: 9999px; border: none; cursor: pointer; transition: background 0.2s;"
          @mouseover="$event.target.style.background='#E09415'"
          @mouseleave="$event.target.style.background='#F5A623'">
          Search
        </button>
      </div>

      <!-- Nav links -->
      <div class="flex items-center gap-6">
        <router-link to="/"
          style="color: #F5F0E8; text-decoration: none; font-size: 0.9rem; opacity: 0.85; transition: opacity 0.2s;"
          @mouseover="$event.target.style.opacity='1'"
          @mouseleave="$event.target.style.opacity='0.85'">
          Home
        </router-link>
        <router-link to="/folders"
          style="color: #F5F0E8; text-decoration: none; font-size: 0.9rem; opacity: 0.85; transition: opacity 0.2s;"
          @mouseover="$event.target.style.opacity='1'"
          @mouseleave="$event.target.style.opacity='0.85'">
          Folders
        </router-link>
        <router-link to="/bookmarks"
          style="color: #F5F0E8; text-decoration: none; font-size: 0.9rem; opacity: 0.85; transition: opacity 0.2s;"
          @mouseover="$event.target.style.opacity='1'"
          @mouseleave="$event.target.style.opacity='0.85'">
          Bookmarks
        </router-link>
        <router-link to="/register"
          style="color: #F5F0E8; text-decoration: none; font-size: 0.9rem; opacity: 0.85; transition: opacity 0.2s;"
          @mouseover="$event.target.style.opacity='1'"
          @mouseleave="$event.target.style.opacity='0.85'">
          Register
        </router-link>
        <button @click="logout"
          style="background: transparent; border: 1px solid rgba(245,166,35,0.5); color: #F5A623; font-size: 0.85rem; padding: 0.4rem 1rem; border-radius: 9999px; cursor: pointer; transition: all 0.2s;"
          @mouseover="e => { e.target.style.background='#F5A623'; e.target.style.color='#2C1810' }"
          @mouseleave="e => { e.target.style.background='transparent'; e.target.style.color='#F5A623' }">
          Logout
        </button>
      </div>

    </div>
  </nav>
</template>