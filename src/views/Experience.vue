<template>
  <div
    class="text-white subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="experience-panel"
    @click="handleDivClick"
  >
    Experience
    <button id="home" class="btn bg-primary-content">Home</button>
  </div>
</template>

<script>
export default {
  name: "experience",
  data() {
    return {
      observer: null,
    };
  },
  methods: {
    handleDivClick() {
      console.log("Hello");
    },
  },
};
</script>
