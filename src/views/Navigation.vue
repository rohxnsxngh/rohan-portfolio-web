<template>
  <div
    class="text-white max-w-none overscroll-none subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-75 text-xs"
    id="navigation-panel"
    @click="handleDivClick"
  >
    <Menu />
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
