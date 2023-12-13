<template>
  <div
    class="text-white overscroll-none subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-xs"
    id="navigation-panel"
    @click="handleDivClick"
  >
    <div class="sm:p-8 p-2">
      <div class="relative inline-block text-white">
        <button class="btn bg-primary-content" @click="toggleDropdown">
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
        </button>

        <div
          v-show="isDropdownOpen"
          class="text-white overscroll-none subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl absolute top-12"
          id="navigation-panel"
        >
          <div class="flex flex-col sm:p-8 p-2">
            <div class="text-xs">
              <ul class="steps steps-vertical">
                <li class="step step-primary" data-content="●">
                  <button id="home" class="btn btn-sm bg-primary-content">Home</button>
                </li>
                <li class="step step-primary" data-content="●">
                  <button id="forge" class="btn btn-sm bg-primary-content">
                    Forge
                  </button>
                </li>
                <li class="step step-primary" data-content="●">
                  <button id="experience" class="btn btn-sm bg-primary-content">
                    Experience
                  </button>
                </li>
                <li class="step step-primary" data-content="●">
                  <button id="about" class="btn btn-sm bg-primary-content">
                    About
                  </button>
                </li>
                <li class="step step-primary" data-content="●">
                  <button id="writing" class="btn btn-sm bg-primary-content">
                    Writing
                  </button>
                </li>
                <li class="step step-primary" data-content="●">
                  <button id="contact" class="btn btn-sm bg-primary-content">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
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
