<template>
  <div
    class="text-white overscroll-none subpixel-antialiased bg-primary-content border border-base-300 opacity-60 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="writing-panel"
  >
    <div class="flex flex-col">
      <div class="m-2">
        <Menu />
      </div>

      <div
        class="hero min-h-screen"
      >
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Writing.
              <div class="divider divider-primary"></div>
              <p class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold">
                Coming soon...
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
  name: "writing",
  components: {
    Menu,
  },
};
</script>
