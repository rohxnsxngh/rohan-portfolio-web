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
              <div class="chat chat-start h-fit">
                <div class="chat-bubble chat-bubble-white text-sm">
                  <p
                    class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-left hover:text-white"
                  >
                    robot model:
                    <a
                      class="link"
                      href="https://sketchfab.com/3d-models/robot-playground-59fc99d8dcb146f3a6c16dbbcc4680da"
                    >
                      attribution</a
                    >
                  </p>
                </div>
              </div>
              <div class="chat chat-end h-fit">
                <div class="chat-bubble chat-bubble-primary text-sm">
                  <p
                    class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-left hover:text-white"
                  >
                    flaticon:
                    <a
                      class="link"
                      href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation"
                    >
                      attribution</a
                    >
                  </p>
                </div>
              </div>
              <div class="chat chat-start h-fit">
                <div class="chat-bubble chat-bubble-white text-sm">
                  <p
                    class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-left hover:text-white"
                  >
                    fluid simulation:
                    <a
                      class="link"
                      href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation"
                    >
                      attribution</a
                    >
                  </p>
                </div>
              </div>
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
