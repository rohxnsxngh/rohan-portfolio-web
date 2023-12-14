<template>
  <div
    class="text-white fixed overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-75 text-xs"
    id="navigation-panel"
    @click="handleDivClick"
  >
    <div class="grid grid-rows-6 grid-cols-6 grid-flow-col gap-4">
      <div class="">
        <Menu />
      </div>

      <div
        class="hero min-h-screen row-start-2 col-start-1 row-span-5 col-span-6"
      >
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Welcome</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Menu from "../components/Menu.vue";

export default {
  name: "navigation",
  components: {
    Menu,
  },
  data() {
    return {
      isDropdownOpen: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
  },
};
</script>
