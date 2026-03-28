<script setup>
import { ref } from "vue";
import { login } from "../services/api";
import { useRouter } from "vue-router";
const router = useRouter();

const email = ref("");
const password = ref("");
const message = ref("");

async function handleLogin() {
  const res = await login({
    email: email.value,
    password: password.value
  });

  if (res.access_token) {
    localStorage.setItem("token", res.access_token);
    router.push("/");
  } else {
    message.value = res.detail || "Login failed";
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-md w-80">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

      <input
        v-model="email"
        placeholder="Email"
        class="w-full mb-3 p-2 border rounded-lg"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full mb-4 p-2 border rounded-lg"
      />

      <button
        @click="handleLogin"
        class="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
      >
        Login
      </button>

      <p class="text-red-500 mt-3 text-center">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.auth {
  max-width: 300px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input, button {
  padding: 10px;
}
</style>