<template>
  <div
    class="text-white overscroll-none touch-none subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-5 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="init-panel"
    @click="handleDivClick"
  ></div>
</template>

<script>
export default {
  name: "init",
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
