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
<div class="p-6">
  <!-- Search mode banner -->
  <div v-if="isSearching" class="mb-4 flex items-center gap-3 text-gray-600">
    <span>Showing search results</span>
    <button @click="handleSearch('')" class="text-sm text-orange-500 hover:underline">
      Clear search
    </button>
  </div>

  <div v-if="correctedQuery" class="mb-3 text-sm text-gray-500">
    Showing results for <span class="font-medium text-gray-800">{{ correctedQuery }}</span>
  </div>

  <!-- SEARCH MODE -->
  <div v-if="isSearching">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <DishCard
        v-for="recipe in recipes"
        :key="recipe.recipe_id"
        :title="recipe.name"
        :image="recipe.images"
        :description="recipe.description"
        :category="recipe.category"
        :recipe="recipe"
        @select="selectRecipe(recipe)"
      />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <DishCard
        v-for="recipe in recipes"
        :key="recipe.recipe_id"
        :title="recipe.name"
        :image="recipe.images"
        :description="recipe.description"
        :category="recipe.category"
        :recipe="recipe"
        @select="selectRecipe(recipe)"
      />
    </div>
  </div>

  <!-- BROWSE MODE -->
  <div v-else>
    <!-- Recommendations -->
    <div v-if="recommendations.has_bookmarks" class="mt-10 space-y-10">

      <div v-if="recommendations.all_folders.length > 0">
        <h2 class="text-xl font-bold mb-4">Based on your bookmarks</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <DishCard
            v-for="recipe in recommendations.all_folders"
            :key="recipe.recipe_id"
            :title="recipe.name"
            :image="recipe.images"
            :description="recipe.description"
            :category="recipe.category"
            :recipe="recipe"
            @select="selectRecipe(recipe)"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center gap-4 mb-4">
          <h2 class="text-xl font-bold">
            {{ selectedCategory || recommendations.top_category || 'Category' }} recipes
          </h2>
          <select
            v-model="selectedCategory"
            @change="handleCategoryChange"
            class="border rounded px-3 py-1 text-sm"
          >
            <option :value="null">Auto ({{ recommendations.top_category }})</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div v-if="recommendations.category.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <DishCard
            v-for="recipe in recommendations.category"
            :key="recipe.recipe_id"
            :title="recipe.name"
            :image="recipe.images"
            :description="recipe.description"
            :category="recipe.category"
            :recipe="recipe"
            @select="selectRecipe(recipe)"
          />
        </div>
      </div>

      <div v-if="recommendations.random.length > 0">
        <h2 class="text-xl font-bold mb-4">Discover something new</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <DishCard
            v-for="recipe in recommendations.random"
            :key="recipe.recipe_id"
            :title="recipe.name"
            :image="recipe.images"
            :description="recipe.description"
            :category="recipe.category"
            :recipe="recipe"
            @select="selectRecipe(recipe)"
          />
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