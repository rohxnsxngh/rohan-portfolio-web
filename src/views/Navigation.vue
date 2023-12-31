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
          <div class="sm:max-w-5xl max-w-xs">
            <div class="h-fit">
              <h1
                class="text-4xl md:text-4xl lg:text-6xl xl:text-8xl text-left font-bold text-center"
              >
                Welcome.
                <div class="divider divider-primary"></div>
                <p
                  class="text-lg md:text-xl lg:text-2xl xl:text-2xl 2xl:text-4xl font-semibold text-left"
                >
                  Thank you for taking time to check out my portfolio. I hope
                  you enjoy my portfolio website as much as I enjoyed building
                  it. If you have any questions or comments, I would love to
                  hear them. You can reach me
                  <a
                    id="contact"
                    class="underline decoration-solid text-primary"
                    >here.</a
                  >
                </p>
              </h1>
            </div>
            <div
              class="mockup-browser border border-primary bg-primary-content h-fit sm:w-full w-96 mt-6 hover:border-white"
            >
              <div class="mockup-browser-toolbar">
                <div class="input border border-base-300 text-md">
                  https://rohxnsxngh.com
                </div>
              </div>
              <div
                class="typewriter flex justify-center px-4 py-16 border-t border-base-300 font-semibold"
              >
                <h1>Hello!</h1>
                <br />
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

<style scoped>
/* DEMO-SPECIFIC STYLES */
.typewriter h1 {
  color: #fff;
  font-family: monospace;
  overflow: hidden; /* Ensures the content is not revealed until the animation */
  border-right: 0.15em solid orange; /* The typwriter cursor */
  white-space: nowrap; /* Keeps the content on a single line */
  margin: 0 auto; /* Gives that scrolling effect as the typing happens */
  letter-spacing: 0.15em; /* Adjust as needed */
  animation: typing 2.5s steps(30, end) infinite alternate,
    blink-caret 0.5s step-end infinite;
}

/* The typing effect */
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

/* The typewriter cursor effect */
@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: orange;
  }
}
</style>
