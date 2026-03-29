<script setup>
import { ref, onMounted } from "vue";
import { getBookmarks, updateBookmark, deleteBookmark, getFolders } from "../services/api";

const bookmarks = ref([]);
const folders = ref([]);
const sort = ref("rating");

async function loadBookmarks() {
  bookmarks.value = await getBookmarks(sort.value);
  folders.value = await getFolders();
}

function folderName(folderId) {
  if (!folderId) return "No folder";
  return folders.value.find(f => f.folder_id === folderId)?.folder_name || "Unknown";
}

async function handleRatingChange(bookmark, rating) {
  await updateBookmark(bookmark.bookmark_id, { rating });
  await loadBookmarks();
}

async function handleFolderChange(bookmark, folderId) {
  await updateBookmark(bookmark.bookmark_id, { folder_id: folderId || null });
  await loadBookmarks();
}

async function handleDelete(bookmarkId) {
  if (!confirm("Remove this bookmark?")) return;
  await deleteBookmark(bookmarkId);
  await loadBookmarks();
}

onMounted(loadBookmarks);
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">My Bookmarks</h1>
      <select v-model="sort" @change="loadBookmarks" class="border rounded px-3 py-1 text-sm">
        <option value="rating">Sort by rating</option>
        <option value="date">Sort by date</option>
      </select>
    </div>

    <div v-if="bookmarks.length === 0" class="text-gray-400 text-center py-12">
      No bookmarks yet.
    </div>

    <ul class="space-y-4">
      <li v-for="b in bookmarks" :key="b.bookmark_id"
        class="border rounded-xl px-5 py-4 flex items-center justify-between gap-4">

        <div class="flex-1">
          <p class="font-semibold">Recipe #{{ b.recipe_id }}</p>

          <!-- Folder selector -->
          <select
            :value="b.folder_id || (folders.length > 0 ? folders[0].folder_id : '')"
            @change="handleFolderChange(b, $event.target.value)"
            class="text-sm border rounded px-2 py-0.5 mt-1"
            >
            <option v-for="f in folders" :key="f.folder_id" :value="f.folder_id">
                {{ f.folder_name }}
            </option>
          </select>
        </div>

        <!-- Star rating -->
        <div class="flex gap-0.5">
          <button
            v-for="star in 5"
            :key="star"
            @click="handleRatingChange(b, star)"
            :class="star <= (b.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
            class="text-xl"
          >★</button>
        </div>

        <!-- Delete -->
        <button @click="handleDelete(b.bookmark_id)" class="text-red-500 hover:text-red-700 text-sm">
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>