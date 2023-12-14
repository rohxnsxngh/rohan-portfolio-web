<template>
  <div class="sm:p-4 p-2">
    <div class="relative inline-block text-white">
      <div class="flex">
        <button
          class="btn bg-primary-content border-none w-32 focus:outline-none hover:text-white hover:bg-primary"
          @click="toggleDropdown"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-circle avatar antialiased right-0"
          >
            <div class="w-12 rounded-full">
              <img alt="Profile Picture" src="/Images/profile.jpg" />
            </div>
          </div>
        </button>
      </div>

      <div
        v-show="isDropdownOpen"
        class="text-white sm:w-60 w-48 h-72 overscroll-none subpixel-antialiased bg-primary-content border border-base-300 opacity-90 text-4xl rounded-lg md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl absolute top-12"
        id="navigation-panel"
      >
        <div class="flex flex-col p-2">
          <div class="sm:text-sm text-xs space-y-1">
            <button
              id="home"
              class="btn btn-sm border-none text-center bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3"
              @click="toggleDropdown"
            >
              Home
            </button>
            <button
              id="navigation"
              class="btn btn-sm border-none text-center bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3"
              @click="toggleDropdown"
            >
              Navigation
            </button>
            <button
              id="about"
              class="btn btn-sm border-none bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3"
              @click="toggleDropdown"
            >
              About
            </button>
            <button
              id="forge"
              class="btn btn-sm border-none bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3"
              @click="toggleDropdown"
            >
              Forge
            </button>
            <button
              id="experience"
              class="btn btn-sm border-none bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3"
              @click="toggleDropdown"
            >
              Experience
            </button>
            <button
              id="writing"
              class="btn btn-sm border-none bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3"
              @click="toggleDropdown"
            >
              Writing
            </button>
            <button
              id="contact"
              class="btn btn-sm border-none bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3"
              @click="toggleDropdown"
            >
              Contact
            </button>
          </div>
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
