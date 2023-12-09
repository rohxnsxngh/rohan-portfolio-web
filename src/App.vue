<template>
  <div class="text-white glass text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl" id="vueapp" @click="handleDivClick">
    <!-- Your title content goes here -->
    Rohan Singh
  </div>
</template>

<script>
import Home from "./components/Home.vue";

export default {
  name: "home",
  components: {
    Home,
  },
  data() {
    return {
      observer: null,
    };
  },
  methods: {
    handleDivClick() {
      console.log("Hello");
      // You can perform additional actions here
    },
  },
};
</script>

<style scoped>
/* #vueapp {
  width: 1px;
} */
</style>
