import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue"
import Folders from "../views/Folders.vue";

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
  { path: "/register", component: Register },
  {
    path: "/folders",
    component: Folders,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) next("/login");
      else next();
    }
  }
];


export default createRouter({
  history: createWebHistory(),
  routes
});