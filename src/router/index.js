import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";


const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../components/Home.vue"),
    },
  ],
});

export default router;
