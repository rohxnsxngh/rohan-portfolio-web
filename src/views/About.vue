<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="about-panel" @click="handleDivClick">
    <div class="flex flex-col">
      <div class="">
        <Menu />
      </div>

      <div class="hero min-h-screen">
        <div class="hero-content text-left">
          <div class="max-w-md">
            <h1 class="text-4xl md:text-4xl lg:text-6xl xl:text-6xl text-left font-bold">
              Little bit about me.
              <div class="divider"></div>
              <p class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold">
                I am a software engineer with a background in mechanical
                engineering and a passion for developing innovative solutions.
                My experience in engineering has given me a solid foundation in
                the principles of robotics, mechatronics, and dynamics, which I
                have applied to my work in software development. In my free
                time, I enjoy exploring new developments in robotics and
                mechatronics, and applying my skills to personal projects that
                challenge me to learn and grow.
              </p>
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
  name: "about",
  components: {
    Menu,
  },
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
