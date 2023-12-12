<template>
  <div
    class="text-white overscroll-none subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="forge-panel"
    @click="handleDivClick"
  >
    Forge
    <div class="flex flex-col sm:p-10 p-2">
      <div></div>
      <Breadcrumbs :pages="breadcrumbPages" class="float-right"/>
    </div>
  </div>
</template>

<script>
import Breadcrumbs from "../components/Breadcrumbs.vue";

export default {
  name: "forge",
  components: {
    Breadcrumbs,
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
