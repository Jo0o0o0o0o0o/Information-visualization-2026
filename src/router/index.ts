import { createRouter, createWebHistory } from 'vue-router'
import Home from "@/views/Home.vue";
import Compare from "@/views/Compare.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component: Home },
    { path: "/compare", component: Compare },
  ],
});


