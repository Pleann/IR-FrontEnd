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
  <div style="background: #FDF8F2; min-height: 100vh; font-family: 'Georgia', serif;">
    <div class="max-w-5xl mx-auto px-8 py-8">

      <!-- Folder detail view -->
      <div v-if="selectedFolder">
        <div class="flex items-center gap-3 mb-8">
          <button @click="selectedFolder = null; folderRecipes = []"
            style="color: #F5A623; font-size: 0.9rem; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
            ← Back
          </button>
          <span style="color: #D4956A;">|</span>
          <h1 style="color: #2C1810; font-size: 1.75rem; font-weight: 700;">
            {{ selectedFolder.folder_name }}
          </h1>
        </div>

        <div v-if="loadingRecipes" class="text-center py-16"
          style="color: #8B6347;">Loading...</div>

        <div v-else-if="folderRecipes.length === 0" class="text-center py-16"
          style="color: #8B6347;">No bookmarks in this folder yet.</div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="recipe in folderRecipes" :key="recipe.recipe_id">
            <DishCard :title="recipe.name" :image="recipe.images"
              :description="recipe.description" :category="recipe.category"
              :recipe="recipe" @select="selectRecipe(recipe)" />
            <div class="flex gap-0.5 mt-2 px-1 items-center">
              <span v-for="star in 5" :key="star"
                :style="star <= (recipe.rating || 0) ? 'color:#F5A623' : 'color:#D4956A; opacity:0.3'"
                style="font-size: 0.9rem;">★</span>
              <span style="color: #8B6347; font-size: 0.75rem; margin-left: 0.25rem;">
                {{ recipe.rating || 0 }}/5
              </span>
            </div>
          </div>
        </div>

        <!-- Suggestions -->
        <div class="mt-12">
          <div style="border-top: 2px solid #E8D5BF; padding-top: 2rem;" class="flex items-center justify-between mb-6">
            <div>
              <p style="color: #8B6347; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.25rem;">
                AI Picks
              </p>
              <h2 style="color: #2C1810; font-size: 1.4rem; font-weight: 700;">
                You might also like
              </h2>
            </div>
            <button @click="loadSuggestions"
              style="background: #2C1810; color: #F5A623; padding: 0.5rem 1.25rem; border-radius: 9999px; border: none; cursor: pointer; font-size: 0.85rem; font-family: Georgia, serif; transition: background 0.2s;"
              @mouseover="$event.target.style.background='#5C3317'"
              @mouseleave="$event.target.style.background='#2C1810'">
              Get suggestions
            </button>
          </div>

          <div v-if="loadingSuggestions" style="color: #8B6347;" class="text-center py-8">
            Finding recipes for you...
          </div>

          <div v-if="suggestions.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <DishCard v-for="recipe in suggestions" :key="recipe.recipe_id"
              :title="recipe.name" :image="recipe.images" :description="recipe.description"
              :category="recipe.category" :recipe="recipe" @select="selectRecipe(recipe)" />
          </div>
        </div>
      </div>

      <!-- Folders grid -->
      <div v-else>
        <div class="flex items-center justify-between mb-8">
          <div>
            <p style="color: #8B6347; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.25rem;">
              My Collection
            </p>
            <h1 style="color: #2C1810; font-size: 1.75rem; font-weight: 700;">Folders</h1>
          </div>
        </div>

        <!-- Create folder -->
        <div class="flex gap-2 mb-8">
          <input v-model="newFolderName" @keyup.enter="handleCreate" type="text"
            placeholder="New folder name..."
            style="flex: 1; border: 1px solid #D4956A; border-radius: 9999px; padding: 0.6rem 1.25rem; font-size: 0.9rem; font-family: Georgia, serif; color: #2C1810; background: white; outline: none;"
            @focus="$event.target.style.borderColor='#F5A623'"
            @blur="$event.target.style.borderColor='#D4956A'" />
          <button @click="handleCreate"
            style="background: #F5A623; color: #2C1810; font-weight: 700; padding: 0.6rem 1.5rem; border-radius: 9999px; border: none; cursor: pointer; font-family: Georgia, serif; transition: background 0.2s;"
            @mouseover="$event.target.style.background='#E09415'"
            @mouseleave="$event.target.style.background='#F5A623'">
            + Create
          </button>
        </div>
        <p v-if="error" style="color: #DC2626; font-size: 0.85rem; margin-bottom: 1rem;">{{ error }}</p>

        <div v-if="folders.length === 0" class="text-center py-16"
          style="color: #8B6347;">No folders yet. Create one above.</div>

        <!-- Folders grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="folder in folders" :key="folder.folder_id"
            style="border-radius: 1rem; overflow: hidden; box-shadow: 0 2px 8px rgba(44,24,16,0.08); transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; background: white;"
            @click="openFolder(folder)"
            @mouseover="e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(44,24,16,0.15)'; e.currentTarget.style.transform='translateY(-2px)' }"
            @mouseleave="e => { e.currentTarget.style.boxShadow='0 2px 8px rgba(44,24,16,0.08)'; e.currentTarget.style.transform='translateY(0)' }">

            <!-- Preview image -->
            <div style="width: 100%; height: 10rem; background: #F5ECD8; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img v-if="folderPreviews[folder.folder_id]"
                :src="folderPreviews[folder.folder_id]"
                style="width: 100%; height: 100%; object-fit: cover;"
                @error="folderPreviews[folder.folder_id] = ''" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="#D4956A" style="width: 4rem; height: 4rem;">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>

            <!-- Footer -->
            <div style="padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between;">
              <div v-if="editingFolder?.folder_id === folder.folder_id"
                class="flex gap-2 flex-1" @click.stop>
                <input v-model="editName" @keyup.enter="handleRename"
                  style="flex: 1; border: 1px solid #D4956A; border-radius: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.85rem; outline: none;" />
                <button @click="handleRename"
                  style="color: #16A34A; font-size: 0.8rem; background: none; border: none; cursor: pointer;">Save</button>
                <button @click="editingFolder = null"
                  style="color: #8B6347; font-size: 0.8rem; background: none; border: none; cursor: pointer;">Cancel</button>
              </div>
              <span v-else style="color: #2C1810; font-weight: 600; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ folder.folder_name }}
              </span>
              <div v-if="editingFolder?.folder_id !== folder.folder_id"
                class="flex gap-2 ml-2" @click.stop>
                <button @click="startEdit(folder)"
                  style="color: #F5A623; font-size: 0.75rem; background: none; border: none; cursor: pointer;">Rename</button>
                <button @click="handleDelete(folder.folder_id)"
                  style="color: #DC2626; font-size: 0.75rem; background: none; border: none; cursor: pointer;">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecipeDetail v-if="selectedRecipe" :recipe="selectedRecipe" @close="selectedRecipe = null" />
    </div>
  </div>
</template>