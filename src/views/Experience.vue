<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="experience-panel"
    @click="handleDivClick"
  >
    <div class="grid grid-rows-6 grid-cols-6 grid-flow-col gap-2">
      <div class="">
        <Menu />
      </div>

      <div
        role="tablist"
        class="tabs tabs-lifted sm:tabs-sm tabs-xs bg-primary-content row-start-2 col-start-1 col-span-6 text-sm my-4"
      >
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white"
          aria-label="Toyota Motors North America"
        />
        <div
          role="tabpanel"
          class="tabs tabs-lifted tabs-xs bg-primary-content text-4xl my-4 col-span-6"
        >
          <br />
          <h1 class="text-4xl font-bold">Toyota Motors North America</h1>
          <div class="divider"></div>
          <h1 class="text-2xl">Software Systems Engineer I</h1>
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white"
          aria-label="Tesla"
        />
        <div
          role="tabs tabs-lifted tabs-xs bg-primary-content row-start-2 col-start-1 col-span-6 text-sm my-4"
        ></div>

        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white"
          aria-label="Tesla"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumbs from "../components/Breadcrumbs.vue";
import Menu from "../components/Menu.vue";

export default {
  name: "experience",
  components: {
    Breadcrumbs,
    Menu,
  },
  data() {
    return {
      observer: null,
      breadcrumbPages: [
        { text: "Home", id: "home" },
        { text: "Navigation", id: "navigation" },
        { text: "Experience", id: "experience" },
      ],
    };
  },
  methods: {
    handleDivClick() {
      console.log("Hello");
    },
  },
};
</script>
