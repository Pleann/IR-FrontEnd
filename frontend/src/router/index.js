import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue"

const isAuthenticated = () => !!localStorage.getItem("token");

const routes = [
  {
    path: "/",
    component: Home,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) next("/login");
      else next();
    }
  },
  { path: "/login", component: Login },
  { path: "/register", component: Register }
];


export default createRouter({
  history: createWebHistory(),
  routes
});