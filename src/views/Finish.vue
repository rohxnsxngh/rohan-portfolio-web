<template>
    <div
      class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
      id="finish-panel"
      @click="handleDivClick"
    >
      <div class="flex flex-col">
        <div class="m-2">
          <Menu />
        </div>
  
        <div
          class="hero min-h-screen"
        >
          <div class="hero-content text-center">
            <div class="max-w-md">
              <h1 class="text-5xl font-bold">
                Finish
                <div class="divider"></div>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Menu from "../components/Menu.vue";
  
  export default {
    name: "contact",
    components: {
      Menu,
    },
    data() {
      return {
        observer: null,
        breadcrumbPages: [
          { text: "Home", id: "home" },
          { text: "Navigation", id: "navigation" },
          { text: "Contact", id: "contact" },
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
  