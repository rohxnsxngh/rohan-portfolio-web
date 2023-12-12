<template>
  <div
    class="text-white overscroll-none subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="navigation-panel"
    @click="handleDivClick"
  >
    <!-- Your title content goes here -->
    <div class="sm:flex sm:flex-row flex-col sm:p-10 p-2">
      <div class="avatar sm:h-full h-0 sm:w-48 mr-10 sm:block hidden">
        <div
          class="w-full rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2"
        >
          <img src="/Images/profile.jpg" />
        </div>
      </div>
      <div class="grid grid-rows-3 grid-flow-col sm:gap-10 gap-4">
        <div>
          <button id="home" class="btn bg-primary-content">Home</button>
        </div>
        <div>
          <button id="forge" class="btn bg-primary-content">Forge</button>
        </div>
        <div>
          <button id="experience" class="btn bg-primary-content">
            Experience
          </button>
        </div>
        <div>
          <button id="about" class="btn bg-primary-content">About</button>
        </div>
        <div>
          <button id="writing" class="btn bg-primary-content">Writing</button>
        </div>
        <div>
          <button id="contact" class="btn bg-primary-content">Contact</button>
        </div>
      </div>
    </div>
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
