<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="forge-panel"
    @click="handleDivClick"
  >
    <!-- <div class="grid grid-rows-6 grid-flow-col gap-4"> -->
      <Menu />
    <!-- </div> -->
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
