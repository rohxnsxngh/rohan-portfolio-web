<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="forge-panel"
    @click="handleDivClick"
  >
    <div class="grid grid-rows-6 grid-cols-6 grid-flow-col gap-4">
      <div class="m-2">
        <Menu />
      </div>

      <div
        class="hero min-h-screen row-start-2 col-start-1 row-span-5 col-span-6"
      >
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Forge.</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumbs from "../components/Breadcrumbs.vue";
import Menu from "../components/Menu.vue";

export default {
  name: "forge",
  components: {
    Breadcrumbs,
    Menu,
  },
  data() {
    return {
      observer: null,
      breadcrumbPages: [
        { text: "Home", id: "home" },
        { text: "Navigation", id: "navigation" },
        { text: "Forge", id: "forge" },
      ],
    };
  },
  methods: {
    handleDivClick() {
      console.log("Hello");
    },
  },
};
</script>
