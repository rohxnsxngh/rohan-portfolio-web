<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 opacity-55 text-4xl rounded-lg"
    id="navigation-panel"
  >
    <div class="flex flex-col">
      <div class="m-2">
        <Menu />
      </div>

      <div class="hero min-h-screen">
        <div class="hero-content text-center">
          <div class="lg:max-w-4xl max-w-md">
            <div class="h-fit">
              <h1
                class="text-4xl md:text-4xl lg:text-6xl xl:text-8xl text-left font-bold text-center"
              >
                Welcome.
                <div class="divider divider-primary"></div>
                <p
                  class="text-lg md:text-xl lg:text-2xl xl:text-2xl 2xl:text-4xl font-semibold text-left h-fit"
                >
                  I hope you enjoy exploring my portfolio website as much as I
                  enjoyed building it. If you have any questions or comments, I
                  would love to hear them. You can reach me
                  <a
                    id="contact"
                    class="underline decoration-solid text-primary"
                    >here.</a
                  >
                </p>
              </h1>
              <div
                class="mockup-browser border border-primary bg-primary-content h-fit sm:w-full w-96 mt-20 hover:border-white"
              >
                <div class="mockup-browser-toolbar">
                  <div class="input border border-base-300 text-md">
                    https://rohxnsxngh.com
                  </div>
                </div>
                <div
                  class="flex justify-center px-4 py-16 border-t border-base-300 font-semibold"
                >
                  Hello!<br/>
                </div>
              </div>
            </div>
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
