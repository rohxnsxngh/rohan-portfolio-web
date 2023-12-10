<template>
  <div class="text-white bg-black opacity-90 glass text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl" id="vueapp" @click="handleDivClick">
    <!-- Your title content goes here -->
    Rohan Singh
    <button id="home" class="btn btn-primary">Home</button>
    <canvas>hello</canvas>
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
