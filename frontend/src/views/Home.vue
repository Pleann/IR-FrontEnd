```vue
<script setup>
import { ref, onMounted, computed, watch, inject } from "vue";
import {
  getRecipes,
  searchRecipes,
  getRecommendations,
  getCategories,
  getRecipesByCategory
} from "../services/api";

import DishCard from "../components/DishCard.vue";
import RecipeDetail from "../components/RecipeDetail.vue";

const props = defineProps({
  searchQuery: {
    type: String,
    default: ""
  }
});

const searchQuery = inject("searchQuery");

const recipes = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = 16;

const selectedRecipe = ref(null);

const isSearching = ref(false);
const correctedQuery = ref(null);

const categories = ref([]);
const selectedCategory = ref(null);

const recommendations = ref({
  all_folders: [],
  category: [],
  top_category: null,
  random: [],
  has_bookmarks: false
});


// ✅ NEW: better condition
const hasRecommendations = computed(() => {
  return (
    recommendations.value.all_folders.length > 0 ||
    recommendations.value.category.length > 0 ||
    recommendations.value.random.length > 0
  );
});


// ---------------- API CALLS ----------------

async function loadRecipes() {
  const res = await getRecipes(currentPage.value, perPage);
  console.log("recipes:", res);
  recipes.value = res.data || [];
  totalPages.value = res.total_pages || 1;
}

async function loadRecommendations(category = null) {
  try {
    const res = await getRecommendations(category);
    console.log("recommendations:", res);
    recommendations.value = res;
  } catch (e) {
    console.error("recommendations failed:", e);
  }
}

async function loadCategories() {
  try {
    const res = await getCategories();
    categories.value = res.categories || [];
  } catch (e) {
    console.error("categories failed:", e);
  }
}


// ---------------- SEARCH ----------------

async function handleSearch(query) {
  if (!query) {
    isSearching.value = false;
    correctedQuery.value = null;
    await loadRecipes();
    return;
  }

  isSearching.value = true;

  try {
    const res = await searchRecipes(query);

    correctedQuery.value = res.corrected_query ?? null;

    recipes.value = res.results.map(r => ({
      recipe_id: r.RecipeId,
      name: r.Name,
      images: r.Images,
      description: r.Description,
      category: r.RecipeCategory,
      ingredients: r.Ingredients,
      instructions: r.Instructions,
      total_time: r.TotalTime,
      rating: r.AggregatedRating,
    }));
  } catch (e) {
    console.error("search error:", e);
  }
}


// ---------------- CATEGORY ----------------

async function handleCategoryChange() {
  if (!selectedCategory.value) {
    await loadRecommendations();
    return;
  }

  const res = await getRecipesByCategory(selectedCategory.value);
  recommendations.value.category = res.category || [];
}


// ---------------- WATCHERS ----------------

watch(() => props.searchQuery, (q) => handleSearch(q));

watch(currentPage, () => loadRecipes());

watch(searchQuery, (q) => handleSearch(q));


// ---------------- INIT ----------------

onMounted(() => {
  loadRecipes();

  const token = localStorage.getItem("token");

  // ✅ only call auth endpoints if logged in
  if (token) {
    loadRecommendations();
    loadCategories();
  }
});


// ---------------- UI ----------------

function selectRecipe(recipe) {
  selectedRecipe.value = recipe;
}
</script>


<template>
  <div style="background: #FDF8F2; min-height: 100vh;">

    <!-- ================= SEARCH ================= -->
    <div v-if="isSearching">
      <div v-if="correctedQuery" class="max-w-7xl mx-auto px-8 pt-3">
        <p style="color: #8B6347; font-size: 0.85rem;">
          Showing results for
          <span style="color: #2C1810; font-weight: 600;">{{ correctedQuery }}</span>
        </p>
      </div>
      <div class="max-w-7xl mx-auto px-8 py-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <DishCard v-for="recipe in recipes" :key="recipe.recipe_id"
            :title="recipe.name"
            :image="recipe.images"
            :description="recipe.description"
            :category="recipe.category"
            :recipe="recipe"
            @select="selectRecipe(recipe)" />
        </div>
      </div>
    </div>


    <!-- ================= BROWSE ================= -->
    <div v-else>

      <!-- ✅ RECOMMENDATIONS -->
      <div v-if="hasRecommendations" class="max-w-7xl mx-auto px-8 py-10 space-y-10">

        <h2 class="text-2xl font-bold">Recommended for you</h2>

        <!-- All bookmarks -->
        <div v-if="recommendations.all_folders.length">
          <h3 class="text-xl mb-3">Based on your bookmarks</h3>
          <div class="grid grid-cols-4 gap-6">
            <DishCard v-for="r in recommendations.all_folders" :key="r.recipe_id"
              :title="r.name" :image="r.images"
              :description="r.description" :category="r.category"
              :recipe="r" @select="selectRecipe(r)" />
          </div>
        </div>

        <!-- Category -->
        <div>
          <div class="flex items-center gap-4 mb-5">
            <h2 style="color: #2C1810; font-size: 3rem; font-weight: 700;">
              {{ selectedCategory || recommendations.top_category || 'Category' }} recipes
            </h2>
            <select v-model="selectedCategory" @change="handleCategoryChange"
              style="border: 1px solid #D4956A; border-radius: 9999px; padding: 0.3rem 1rem; font-size: 0.85rem; color: #5C3317; background: white; cursor: pointer; outline: none;">
              <option :value="null">Auto ({{ recommendations.top_category }})</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div v-if="recommendations.category.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <DishCard v-for="recipe in recommendations.category" :key="recipe.recipe_id"
              :title="recipe.name" :image="recipe.images" :description="recipe.description"
              :category="recipe.category" :recipe="recipe" @select="selectRecipe(recipe)" />
          </div>
        </div>

        <!-- Random -->
        <div v-if="recommendations.random.length">
          <h3 class="text-xl mb-3">Discover something new</h3>
          <div class="grid grid-cols-4 gap-6">
            <DishCard v-for="r in recommendations.random" :key="r.recipe_id"
              :title="r.name" :image="r.images"
              :description="r.description" :category="r.category"
              :recipe="r" @select="selectRecipe(r)" />
          </div>
        </div>

      </div>


      <!-- ✅ FALLBACK -->
      <div v-else>

        <!-- Hero -->
        <div class="p-10 text-white" style="background: linear-gradient(135deg, #2C1810, #8B6347);">
          <h1 class="text-3xl font-bold">What are you cooking today?</h1>
        </div>

        <!-- Recipes -->
        <div class="max-w-7xl mx-auto px-8 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <DishCard v-for="recipe in recipes" :key="recipe.recipe_id"
              :title="recipe.name"
              :image="recipe.images"
              :description="recipe.description"
              :category="recipe.category"
              :recipe="recipe"
              @select="selectRecipe(recipe)" />
          </div>

          <!-- Pagination -->
          <div class="flex justify-center mt-6 gap-4">
            <button @click="currentPage--" :disabled="currentPage === 1">Prev</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
          </div>
        </div>

      </div>

    </div>

    <!-- Modal -->
    <RecipeDetail
      v-if="selectedRecipe"
      :recipe="selectedRecipe"
      @close="selectedRecipe = null"
    />

  </div>
</template>

