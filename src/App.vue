<template>
  <div
    class="text-white subpixel-antialiased skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="vueapp"
    @click="handleDivClick"
  >
    <!-- Your title content goes here -->
    <div class="sm:flex sm:flex-row flex-col p-4">
      <div class="avatar sm:h-full h-0 sm:w-48 mr-10 sm:visible invisible">
        <div
          class="w-full rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2"
        >
          <img src="/Images/profile.jpg" />
        </div>
      </div>
      <div class="grid grid-rows-3 grid-flow-col gap-4">
        <div><button id="home" class="btn btn-primary">Home</button></div>
        <div><button id="home" class="btn btn-primary">Forge</button></div>
        <div><button id="home" class="btn btn-primary">Experience</button></div>
        <div><button id="home" class="btn btn-primary">Research</button></div>
        <div><button id="home" class="btn btn-primary">Writing</button></div>
        <div><button id="home" class="btn btn-primary">Contact</button></div>
      </div>
    </div>
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
