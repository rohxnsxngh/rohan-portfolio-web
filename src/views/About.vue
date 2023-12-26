<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-60 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="about-panel">
    <div class="flex flex-col">
      <div class="m-2">
        <Menu />
      </div>

      <div class="hero min-h-screen">
        <div class="hero-content text-left">
          <div class="max-w-md">
            <h1 class="text-4xl md:text-4xl lg:text-6xl xl:text-4xl text-left font-bold text-center">
              Little bit about me.
              <div class="divider"></div>
              <p class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-left">
                I am a <span class="text-primary">software engineer</span> with a background in <span class="text-primary">mechanical
                engineering</span> and a passion for developing innovative solutions.
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
};
</script>
