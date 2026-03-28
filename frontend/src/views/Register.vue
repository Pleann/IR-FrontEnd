<script setup>
import { ref } from "vue";
import { register } from "../services/api";
import { useRouter } from "vue-router";

const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const message = ref("");


async function handleRegister() {
  const res = await register({
    username: username.value,
    email: email.value,
    password: password.value
  });

  if (res.message) {
    message.value = "✅ Account created!";
    
    // redirect after short delay
    setTimeout(() => {
      router.push("/login");
    }, 1000);

  } else {
    message.value = res.detail || "Registration failed";
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-md w-80">
      <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>

      <input
        v-model="username"
        placeholder="Username"
        class="w-full mb-3 p-2 border rounded-lg"
      />

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
        @click="handleRegister"
        class="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
      >
        Register
      </button>

      <p class="mt-3 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/login" class="text-blue-500 hover:underline">
          Login
        </router-link>
      </p>

      <p class="mt-3 text-center text-red-500">{{ message }}</p>
    </div>
  </div>
</template>