<script setup>
import { ref, onMounted, computed, watch, inject } from "vue";
import { getRecipes, searchRecipes } from "../services/api";
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

async function loadRecipes() {
  const res = await getRecipes(currentPage.value, perPage);
  console.log("first recipe from API:", res.data[0]);
  recipes.value = res.data;
  totalPages.value = res.total_pages;
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

watch(() => props.searchQuery, (newQuery) => {
  handleSearch(newQuery);
});

onMounted(loadRecipes);

watch(currentPage, () => {
  loadRecipes();
});

watch(searchQuery, (newQuery) => {
  console.log("watch fired:", newQuery);
  handleSearch(newQuery);
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
      <button
        @click="handleSearch('')"
        class="text-sm text-orange-500 hover:underline"
      >
        Clear search
      </button>
    </div>

    <div v-if="correctedQuery" class="mb-3 text-sm text-gray-500">
        Showing results for <span class="font-medium text-gray-800">{{ correctedQuery }}</span>
    </div>

    <!-- Grid -->
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

    <!-- Pagination -->
    <div v-if="!isSearching" class="flex justify-center items-center gap-4 mt-6">
      <button
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        @click="currentPage--"
        :disabled="currentPage === 1"
      >Prev</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        @click="currentPage++"
        :disabled="currentPage === totalPages"
      >Next</button>
    </div>

    <!-- Modal -->
    <RecipeDetail
      v-if="selectedRecipe"
      :recipe="selectedRecipe"
      @close="selectedRecipe = null"
    />
    </div>
</template>