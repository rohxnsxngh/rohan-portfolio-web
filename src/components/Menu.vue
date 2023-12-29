<template>
  <div class="h-fit">
    <button
      class="btn btn-large bg-primary-content border-none w-32 focus:outline-none hover:text-white hover:bg-primary"
      @click="toggleDropdown"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="white"
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

    <Transition appear name="fade">
      <div
        v-show="isDropdownOpen"
        class="text-white sm:w-60 z-[5] w-48 h-80 overscroll-none subpixel-antialiased bg-primary-content border border-base-300 opacity-100 text-4xl rounded-lg md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl absolute sm:top-16 top-12"
        id="navigation-panel"
      >
        <div class="flex flex-col p-2 sm:text-sm text-xs space-y-1">
          <div>
            <button
              id="home"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rr-home text-white mr-2"></i>
              Home
            </button>
          </div>
          <div>
            <button
              id="navigation"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rr-users-alt text-white mr-2"></i>
              Welcome
            </button>
          </div>
          <div>
            <button
              id="about"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rr-bulb text-white mr-2"></i>
              About
            </button>
          </div>
          <div>
            <button
              id="forge"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rr-apps text-white mr-2"></i>
              Projects
            </button>
          </div>
          <div>
            <button
              id="experience"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rs-rocket-lunch text-white mr-2"></i>
              Experience
            </button>
          </div>
          <div>
            <button
              id="writing"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rr-comment-alt text-white mr-2"></i>
              Writing
            </button>
          </div>
          <div>
            <button
              id="contact"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rr-paper-plane text-white mr-2"></i>
              Contact
            </button>
          </div>
          <div>
            <button
              id="credit"
              class="btn btn-sm border-none text-left bg-primary-content hover:text-white hover:bg-primary hover:translate-x-3 inline-block mx-4"
              @click="toggleDropdown"
            >
              <i class="fi fi-rr-handshake text-white mr-2"></i>
              Credits
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
