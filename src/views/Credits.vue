<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 text-4xl rounded-lg opacity-65 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="credit-panel"
  >
    <div class="flex flex-col">
      <div class="m-2">
        <Menu />
      </div>

      <div class="hero min-h-screen">
        <div class="hero-content text-left">
          <div class="lg:max-w-4xl max-w-md">
            <h1
              class="text-4xl md:text-4xl lg:text-6xl xl:text-4xl text-left font-bold text-center"
            >
              Credits.
              <div class="divider"></div>
              <p
                class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-left"
              >
                robot model:<a
                  class="link link-primary"
                  href="https://sketchfab.com/3d-models/robot-playground-59fc99d8dcb146f3a6c16dbbcc4680da"
                >
                  attribution</a
                ><br />
                flaticon:<a
                  class="link link-primary"
                  href="https://www.flaticon.com/"
                >
                  attribution</a
                ><br />
                fluid simulation:<a
                  class="link link-primary"
                  href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation"
                >
                  attribution</a
                ><br />
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
  name: "contact",
  components: {
    Menu,
  },
};
</script>
