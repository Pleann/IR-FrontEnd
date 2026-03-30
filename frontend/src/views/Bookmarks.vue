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
  <div style="background: #FDF8F2; min-height: 100vh; font-family: 'Georgia', serif;">
    <div class="max-w-4xl mx-auto px-8 py-8">

      <!-- Header -->
      <div class="flex justify-between items-end mb-8">
        <div>
          <p style="color: #8B6347; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.25rem;">
            My Collection
          </p>
          <h1 style="color: #2C1810; font-size: 1.75rem; font-weight: 700;">Bookmarks</h1>
        </div>
        <select v-model="sort" @change="loadBookmarks"
          style="border: 1px solid #D4956A; border-radius: 9999px; padding: 0.4rem 1rem; font-size: 0.85rem; color: #5C3317; background: white; cursor: pointer; outline: none;">
          <option value="rating">Sort by rating</option>
          <option value="date">Sort by date</option>
        </select>
      </div>

      <div v-if="bookmarks.length === 0" class="text-center py-16"
        style="color: #8B6347;">No bookmarks yet. Start exploring recipes!</div>

      <ul style="display: flex; flex-direction: column; gap: 1rem;">
        <li v-for="b in bookmarks" :key="b.bookmark_id"
          style="background: white; border: 1px solid #E8D5BF; border-radius: 1rem; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; transition: box-shadow 0.2s;"
          @mouseover="$event.currentTarget.style.boxShadow='0 4px 16px rgba(44,24,16,0.08)'"
          @mouseleave="$event.currentTarget.style.boxShadow='none'">

          <!-- Recipe info -->
          <div style="flex: 1;">
            <p style="color: #2C1810; font-weight: 600; margin-bottom: 0.4rem;">
              Recipe #{{ b.recipe_id }}
            </p>
            <select :value="b.folder_id || (folders.length > 0 ? folders[0].folder_id : '')"
              @change="handleFolderChange(b, $event.target.value)"
              style="border: 1px solid #D4956A; border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.8rem; color: #5C3317; background: #FFF8F0; cursor: pointer; outline: none;">
              <option v-for="f in folders" :key="f.folder_id" :value="f.folder_id">
                {{ f.folder_name }}
              </option>
            </select>
          </div>

          <!-- Star rating -->
          <div class="flex gap-1">
            <button v-for="star in 5" :key="star"
              @click="handleRatingChange(b, star)"
              :style="star <= (b.rating || 0) ? 'color:#F5A623' : 'color:#E8D5BF'"
              style="font-size: 1.4rem; background: none; border: none; cursor: pointer; transition: transform 0.1s; padding: 0;"
              @mouseover="$event.target.style.transform='scale(1.2)'"
              @mouseleave="$event.target.style.transform='scale(1)'">★</button>
          </div>

          <!-- Remove -->
          <button @click="handleDelete(b.bookmark_id)"
            style="color: #8B6347; font-size: 0.8rem; background: none; border: 1px solid #E8D5BF; border-radius: 9999px; padding: 0.3rem 0.9rem; cursor: pointer; transition: all 0.2s;"
            @mouseover="e => { e.target.style.borderColor='#DC2626'; e.target.style.color='#DC2626' }"
            @mouseleave="e => { e.target.style.borderColor='#E8D5BF'; e.target.style.color='#8B6347' }">
            Remove
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>