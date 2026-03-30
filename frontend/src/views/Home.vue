<script setup>
import { ref, onMounted, computed, watch, inject } from "vue";
import { getRecipes, searchRecipes, getRecommendations, getCategories, getRecipesByCategory } from "../services/api";
import DishCard from "../components/DishCard.vue";
import RecipeDetail from "../components/RecipeDetail.vue"

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

async function loadRecommendations(category = null) {
  const url = category
    ? `${API_URL}/recommendations?category=${encodeURIComponent(category)}`
    : null;
  recommendations.value = await getRecommendations(category);
}

async function loadRecipes() {
  const res = await getRecipes(currentPage.value, perPage);
  console.log("first recipe from API:", res.data[0]);
  recipes.value = res.data;
  totalPages.value = res.total_pages;
}

async function loadCategories() {
  const res = await getCategories();
  categories.value = res.categories || [];
}

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
    console.log("search response:", res);
    correctedQuery.value = res.corrected_query ?? null;
    console.log("correctedQuery is now:", correctedQuery.value);
    recipes.value = res.results.map(r => ({
      recipe_id: r.RecipeId,
      name: r.Name,
      images: r.Images,
      description: r.Description,
      category: r.RecipeCategory,
      ingredients: r.Ingredients,
      ingredient_parts: r.Ingredients,   
      instructions: r.Instructions,
      total_time: r.TotalTime,
      rating: r.AggregatedRating,
    }));
  } catch (e) {
    console.error("handleSearch error:", e);
  }
}

async function handleCategoryChange() {
  if (!selectedCategory.value) {
    // revert to auto top category
    const res = await getRecommendations();
    recommendations.value.category = res.category;
    recommendations.value.top_category = res.top_category;
    return;
  }
  const res = await getRecipesByCategory(selectedCategory.value);
  recommendations.value.category = res.category;  // ← only update this slice
}

watch(() => props.searchQuery, (newQuery) => {
  handleSearch(newQuery);
});

onMounted(() => {
  loadRecipes();
  loadRecommendations();
  loadCategories();
});

watch(currentPage, () => {
  loadRecipes();
});

watch(searchQuery, (newQuery) => {
  console.log("watch fired:", newQuery);
  handleSearch(newQuery);
});

watch(isSearching, (val) => {
  console.log("isSearching changed to:", val);
});

function selectRecipe(recipe) {
  console.log("selecting recipe:", recipe);
  selectedRecipe.value = recipe;
}
</script>

<template>
<div style="background: #FDF8F2; min-height: 100vh; font-family: 'Georgia', serif;">

    <!-- Search mode -->
    <div v-if="isSearching">
      <div style="background: #FDF8F2;" class="px-8 py-4 border-b border-orange-100">
        <div class="max-w-7xl mx-auto flex items-center gap-4">
          <span style="color: #8B6347; font-size: 0.9rem;">
            Search results for <strong style="color: #2C1810;">"{{ correctedQuery || '' }}"</strong>
          </span>
          <button @click="handleSearch('')"
            style="color: #F5A623; font-size: 0.85rem; background: none; border: none; cursor: pointer; text-decoration: underline;">
            ✕ Clear
          </button>
        </div>
      </div>

      <div v-if="correctedQuery" class="max-w-7xl mx-auto px-8 pt-3">
        <p style="color: #8B6347; font-size: 0.85rem;">
          Showing results for
          <span style="color: #2C1810; font-weight: 600;">{{ correctedQuery }}</span>
        </p>
      </div>

      <div class="max-w-7xl mx-auto px-8 py-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <DishCard v-for="recipe in recipes" :key="recipe.recipe_id"
            :title="recipe.name" :image="recipe.images" :description="recipe.description"
            :category="recipe.category" :recipe="recipe" @select="selectRecipe(recipe)" />
        </div>
      </div>

      <!-- Browse grid -->
      <div class="max-w-7xl mx-auto px-8 py-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <DishCard v-for="recipe in recipes" :key="recipe.recipe_id"
            :title="recipe.name" :image="recipe.images" :description="recipe.description"
            :category="recipe.category" :recipe="recipe" @select="selectRecipe(recipe)" />
        </div>

        <!-- Pagination -->
        <div class="flex justify-center items-center gap-3 mt-8">
          <button @click="currentPage--" :disabled="currentPage === 1"
            style="padding: 0.5rem 1.25rem; border-radius: 9999px; border: 1px solid #D4956A; color: #8B6347; background: white; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;"
            :style="currentPage === 1 ? 'opacity:0.4; cursor:not-allowed' : ''"
            @mouseover="e => currentPage > 1 && (e.target.style.background='#FFF3E8')"
            @mouseleave="e => e.target.style.background='white'">
            ← Prev
          </button>
          <span style="color: #8B6347; font-size: 0.9rem;">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            style="padding: 0.5rem 1.25rem; border-radius: 9999px; border: 1px solid #D4956A; color: #8B6347; background: white; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;"
            :style="currentPage === totalPages ? 'opacity:0.4; cursor:not-allowed' : ''"
            @mouseover="e => currentPage < totalPages && (e.target.style.background='#FFF3E8')"
            @mouseleave="e => e.target.style.background='white'">
            Next →
          </button>
        </div>
      </div>
    </div>

  <!-- Browse mode -->
    <div v-else>
      <!-- Recommendations -->
      <div v-if="recommendations.has_bookmarks" class="max-w-7xl mx-auto px-8 pb-16 space-y-12">

        <!-- Divider -->
        <div style="border-top: 2px solid #E8D5BF; padding-top: 2rem;">
          <p style="color: #8B6347; font-size: 2.5rem; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.5rem;">
            Personalized for you
          </p>
        </div>

        <!-- All bookmarks -->
        <div v-if="recommendations.all_folders.length > 0">
          <h2 style="color: #2C1810; font-size: 3rem; font-weight: 700; margin-bottom: 1.25rem;">
            Based on your bookmarks
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <DishCard v-for="recipe in recommendations.all_folders" :key="recipe.recipe_id"
              :title="recipe.name" :image="recipe.images" :description="recipe.description"
              :category="recipe.category" :recipe="recipe" @select="selectRecipe(recipe)" />
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
        <div v-if="recommendations.random.length > 0">
          <h2 style="color: #2C1810; font-size: 3rem; font-weight: 700; margin-bottom: 1.25rem;">
            Discover something new
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <DishCard v-for="recipe in recommendations.random" :key="recipe.recipe_id"
              :title="recipe.name" :image="recipe.images" :description="recipe.description"
              :category="recipe.category" :recipe="recipe" @select="selectRecipe(recipe)" />
          </div>
        </div>

      </div>
    </div>

    <!-- Modal -->
    <RecipeDetail v-if="selectedRecipe" :recipe="selectedRecipe" @close="selectedRecipe = null" />
  </div>
</template>