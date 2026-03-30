<script setup>
import { ref, onMounted } from "vue";
import { getFolders, createFolder, renameFolder, deleteFolder, getFolderBookmarks, getRecipeById } from "../services/api";
import DishCard from "../components/DishCard.vue";
import RecipeDetail from "../components/RecipeDetail.vue";

const folders = ref([]);
const folderPreviews = ref({});
const newFolderName = ref("");
const editingFolder = ref(null);
const editName = ref("");
const error = ref("");
const selectedFolder = ref(null);
const folderRecipes = ref([]);
const loadingRecipes = ref(false);
const selectedRecipe = ref(null); 

async function loadFolders() {
  folders.value = await getFolders();
  for (const folder of folders.value) {
    const bookmarks = await getFolderBookmarks(folder.folder_id);
    if (bookmarks.length > 0) {
      const recipe = await getRecipeById(bookmarks[0].recipe_id);
      folderPreviews.value[folder.folder_id] = recipe.Images || "";
    } else {
      folderPreviews.value[folder.folder_id] = "";
    }
  }
}

async function openFolder(folder) {
  selectedFolder.value = folder;
  loadingRecipes.value = true;
  const bookmarks = await getFolderBookmarks(folder.folder_id);
  const results = await Promise.all(bookmarks.map(async b => {
    const recipe = await getRecipeById(b.recipe_id);
    const inIndex = recipe.Name !== `Recipe #${b.recipe_id}`;
    return {
      recipe_id: b.recipe_id,
      name: b.recipe_name || recipe.Name,
      images: b.recipe_image || recipe.Images || "",
      description: inIndex ? recipe.Description : "",
      category: b.recipe_category || recipe.RecipeCategory || "",
      ingredient_parts: b.recipe_ingredients || recipe.Ingredients || "",
      instructions: b.recipe_instructions || recipe.Instructions || "",
      total_time: inIndex ? recipe.TotalTime : "",
      rating: b.rating || 0,
    };
  }));
  folderRecipes.value = results;
  loadingRecipes.value = false;
}

function selectRecipe(recipe) {
  selectedRecipe.value = recipe;  // ← opens RecipeDetail
}

async function handleCreate() {
  if (!newFolderName.value.trim()) return;
  const res = await createFolder(newFolderName.value.trim());
  if (res.detail) { error.value = res.detail; return; }
  newFolderName.value = "";
  error.value = "";
  await loadFolders();
}

function startEdit(folder) {
  editingFolder.value = folder;
  editName.value = folder.folder_name;
}

async function handleRename() {
  if (!editingFolder.value || !editName.value.trim()) return;
  await renameFolder(editingFolder.value.folder_id, editName.value.trim());
  editingFolder.value = null;
  await loadFolders();
}

async function handleDelete(folderId) {
  if (!confirm("Delete this folder? Bookmarks will be kept but unfoldered.")) return;
  await deleteFolder(folderId);
  await loadFolders();
}

onMounted(loadFolders);
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">

    <!-- Folder detail view -->
    <div v-if="selectedFolder">
      <div class="flex items-center gap-3 mb-6">
        <button @click="selectedFolder = null; folderRecipes = []"
          class="text-orange-500 hover:underline text-sm">← Back to folders</button>
        <h1 class="text-2xl font-bold">{{ selectedFolder.folder_name }}</h1>
      </div>

      <div v-if="loadingRecipes" class="text-gray-400 text-center py-12">Loading...</div>

      <div v-else-if="folderRecipes.length === 0" class="text-gray-400 text-center py-12">
        No bookmarks in this folder yet.
      </div>

      <!-- Recipe grid using DishCard -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="recipe in folderRecipes" :key="recipe.recipe_id">
            <DishCard
            :title="recipe.name"
            :image="recipe.images"
            :description="recipe.description"
            :category="recipe.category"
            :recipe="recipe"
            @select="selectRecipe(recipe)"
            />
            <!-- Rating stars below card -->
            <div class="flex gap-0.5 mt-1 px-1">
            <span v-for="star in 5" :key="star"
                :class="star <= (recipe.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                class="text-sm">★</span>
            <span class="text-xs text-gray-400 ml-1">{{ recipe.rating || 0 }}/5</span>
            </div>
        </div>
        </div>
    </div>

    <!-- Folders grid view -->
    <div v-else>
      <h1 class="text-2xl font-bold mb-6">My Folders</h1>

      <div class="flex gap-2 mb-6">
        <input v-model="newFolderName" @keyup.enter="handleCreate" type="text"
          placeholder="New folder name..." class="flex-1 border px-3 py-2 rounded" />
        <button @click="handleCreate"
          class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Create</button>
      </div>
      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

      <div v-if="folders.length === 0" class="text-gray-400 text-center py-12">
        No folders yet. Create one above.
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="folder in folders" :key="folder.folder_id"
          class="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
          @click="openFolder(folder)">
          <div class="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
            v-if="folderPreviews[folder.folder_id]"
            :src="folderPreviews[folder.folder_id]"
            class="w-full h-full object-cover"
            @error="folderPreviews[folder.folder_id] = ''"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-gray-400">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            </div>
          <div class="p-3 flex items-center justify-between">
            <div v-if="editingFolder?.folder_id === folder.folder_id"
              class="flex gap-2 flex-1" @click.stop>
              <input v-model="editName" @keyup.enter="handleRename"
                class="border px-2 py-1 rounded flex-1 text-sm" />
              <button @click="handleRename" class="text-green-600 text-sm">Save</button>
              <button @click="editingFolder = null" class="text-gray-400 text-sm">Cancel</button>
            </div>
            <span v-else class="font-semibold truncate">{{ folder.folder_name }}</span>
            <div v-if="editingFolder?.folder_id !== folder.folder_id"
              class="flex gap-2 ml-2" @click.stop>
              <button @click="startEdit(folder)" class="text-xs text-blue-500 hover:underline">Rename</button>
              <button @click="handleDelete(folder.folder_id)" class="text-xs text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RecipeDetail modal — same as Home.vue -->
    <RecipeDetail
      v-if="selectedRecipe"
      :recipe="selectedRecipe"
      @close="selectedRecipe = null"
    />
  </div>
</template>