<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { getRecipes } from "../services/api";
import DishCard from "../components/DishCard.vue";
import RecipeDetail from "../components/RecipeDetail.vue"

const recipes = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = 16;

const selectedRecipe = ref(null);

async function loadRecipes() {
  const res = await getRecipes(currentPage.value, perPage);
  recipes.value = res.data;
  totalPages.value = res.total_pages;
}

onMounted(loadRecipes);

watch(currentPage, () => {
  loadRecipes();
});

function selectRecipe(recipe) {
  selectedRecipe.value = recipe;
}
</script>

<template>
<div class="p-6">

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <DishCard
        v-for="recipe in recipes"
        :key="recipe.recipe_id"
        :title="recipe.name"
        :image="recipe.images"
        :description="recipe.description"
        :category="recipe.category"
        @select="selectRecipe(recipe)"
      />
    </div>

    <!-- Pagination -->
    <div class="flex justify-center items-center gap-4 mt-6">
      <button
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        @click="currentPage--"
        :disabled="currentPage === 1"
      >
        Prev
      </button>

      <span>
        Page {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        @click="currentPage++"
        :disabled="currentPage === totalPages"
      >
        Next
      </button>
    </div>

    <!-- Modal -->
    <RecipeDetail
      v-if="selectedRecipe"
      :recipe="selectedRecipe"
      @close="selectedRecipe = null"
    />
    </div>
</template>