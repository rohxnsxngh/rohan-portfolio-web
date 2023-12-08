<template>
  <div class="text-black bg-white text-4xl" id="vueapp" @click="handleDivClick">
    hello my name is WOHAN
    <!-- <Home /> -->
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
