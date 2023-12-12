<template>
    <div
      class="text-white subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-0 text-4xl rounded-lg md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
      id="init"
      @click="handleDivClick"
    >
    </div>
  </template>
  
  <script>
  export default {
    name: "navigation",
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
  