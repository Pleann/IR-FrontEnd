<script setup>
import { ref, onMounted, watch } from "vue";
import { getFolders, createBookmark, updateBookmark, deleteBookmark, getBookmarks } from "../services/api";



const props = defineProps({ recipe: Object });
const emit = defineEmits(["close"]);

const showBookmarkPopup = ref(false);
const folders = ref([]);
const selectedFolder = ref(null);
const selectedRating = ref(0);
const existingBookmark = ref(null);

async function loadBookmarkState() {
  const bookmarks = await getBookmarks();
  existingBookmark.value = bookmarks.find(b => b.recipe_id === props.recipe.recipe_id) || null;
  if (existingBookmark.value) {
    selectedFolder.value = existingBookmark.value.folder_id;
    selectedRating.value = existingBookmark.value.rating || 0;
  }
  folders.value = await getFolders();
}

async function saveBookmark() {
  if (existingBookmark.value) {
    await updateBookmark(existingBookmark.value.bookmark_id, {
      folder_id: selectedFolder.value,
      rating: selectedRating.value
    });
  } else {
    await createBookmark({
      recipe_id: props.recipe.recipe_id,
      folder_id: selectedFolder.value,
      rating: selectedRating.value
    });
  }
  showBookmarkPopup.value = false;
  await loadBookmarkState();
}

async function removeBookmark() {
  if (!existingBookmark.value) return;
  await deleteBookmark(existingBookmark.value.bookmark_id);
  existingBookmark.value = null;
  selectedFolder.value = null;
  selectedRating.value = 0;
  showBookmarkPopup.value = false;
}

onMounted(loadBookmarkState);
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white max-w-2xl w-full rounded-xl p-6 overflow-y-auto max-h-[90vh]">

      <!-- Header row -->
      <div class="flex justify-between items-center mb-4">
        <!-- Bookmark icon -->
        <div class="relative">
          <button @click="showBookmarkPopup = !showBookmarkPopup">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="size-6"
              :fill="existingBookmark ? 'currentColor' : 'none'">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </button>

          <!-- Bookmark popup -->
          <div v-if="showBookmarkPopup"
            class="absolute left-0 top-8 bg-white border rounded-xl shadow-lg p-4 z-50 w-64">
            <p class="font-semibold mb-3">Bookmark this recipe</p>

            <!-- Folder select -->
            <label class="text-sm text-gray-600 block mb-1">Folder</label>
            <select v-model="selectedFolder" class="w-full border rounded px-2 py-1 mb-3 text-sm">
              <option :value="null">No folder</option>
              <option v-for="f in folders" :key="f.folder_id" :value="f.folder_id">
                {{ f.folder_name }}
              </option>
            </select>

            <!-- Star rating -->
            <label class="text-sm text-gray-600 block mb-1">Rating</label>
            <div class="flex gap-1 mb-4">
              <button
                v-for="star in 5"
                :key="star"
                @click="selectedRating = star"
                :class="star <= selectedRating ? 'text-yellow-400' : 'text-gray-300'"
                class="text-2xl"
              >★</button>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button @click="saveBookmark"
                class="flex-1 bg-orange-500 text-white py-1 rounded hover:bg-orange-600 text-sm">
                Save
              </button>
              <button v-if="existingBookmark" @click="removeBookmark"
                class="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm">
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Close button -->
        <button class="text-gray-500 hover:text-gray-700" @click="emit('close')">close</button>
      </div>

      <!-- Content -->
      <img :src="recipe.images" class="w-full h-60 object-cover rounded mb-4" />

      <h2 class="text-2xl font-bold mb-2">{{ recipe.name }}</h2>

      <p class="text-gray-500 mb-4">{{ recipe.category }}</p>

      <h3 class="font-semibold mt-4">Ingredients</h3>
      <p class="text-sm text-gray-700 mb-4">
        {{ recipe.ingredient_parts }}
      </p>

      <h3 class="font-semibold">Instructions</h3>
      <p class="text-sm text-gray-700 whitespace-pre-line">
        {{ recipe.instructions }}
      </p>

    </div>
  </div>
</template>