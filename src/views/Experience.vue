<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content skeleton border border-base-300 opacity-90 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="experience-panel"
    @click="handleDivClick"
  >
    <div
      class="grid sm:grid-rows-6 grid-rows-8 sm:grid-cols-6 grid-cols-3 grid-flow-col gap-2"
    >
      <div class="row-start-1 lg:col-start-6 sm:col-start-5 col-start-4 col-span-1">
        <Menu />
      </div>

      <div
        role="tablist"
        class="tabs tabs-lifted lg:tabs-lg sm:tabs-sm tabs-xs bg-primary-content row-start-1 col-start-1 col-span-6 text-sm my-4 top-0"
      >
        <!-- Toyota -->
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white"
          aria-label="Toyota"
          checked
        />
        <div role="tabpanel" class="tab-content bg-primary-content rounded-box">
          <ExperienceToyota />
        </div>
        <!-- Tesla -->
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white"
          aria-label="Tesla"
        />
        <div
          role="tabpanel"
          class="tab-content bg-primary-content rounded-box"
        >
          <ExperienceTesla />
        </div>
        <!-- Tesla -->
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white"
          aria-label="Tesla"
        />
        <div
          role="tabpanel"
          class="tab-content bg-primary=content rounded-box"
        >
          <ExperienceTeslaFirst/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumbs from "../components/Breadcrumbs.vue";
import Menu from "../components/Menu.vue";
import ExperienceToyota from "../components/ExperienceToyota.vue";
import ExperienceTesla from "../components/ExperienceTesla.vue";
import ExperienceTeslaFirst from "../components/ExperienceTeslaFirst.vue";

export default {
  name: "experience",
  components: {
    Breadcrumbs,
    Menu,
    ExperienceToyota,
    ExperienceTesla,
    ExperienceTeslaFirst
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
