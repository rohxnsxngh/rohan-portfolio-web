<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 opacity-90 text-4xl rounded-lg opacity-90"
    id="experience-panel"
    @click="handleDivClick"
  >
  <div class="flex flex-col">
    <div class="top-0">
      <Menu />
    </div>
    <div class="h-screen mb-48">
      <div
        role="tablist"
        class="tabs tabs-lifted lg:tabs-lg sm:tabs-sm tabs-xs bg-primary-content"
      >
        <!-- Toyota -->
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white font-semibold"
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
          class="tab hover:bg-primary hover:text-white font-semibold"
          aria-label="Tesla"
        />
        <div role="tabpanel" class="tab-content bg-primary-content rounded-box">
          <ExperienceTesla />
        </div>
        <!-- Tesla -->
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab hover:bg-primary hover:text-white font-semibold"
          aria-label="Tesla"
        />
        <div role="tabpanel" class="tab-content bg-primary-content rounded-box">
          <ExperienceTeslaFirst />
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import Menu from "../components/Menu.vue";
import ExperienceToyota from "../components/ExperienceToyota.vue";
import ExperienceTesla from "../components/ExperienceTesla.vue";
import ExperienceTeslaFirst from "../components/ExperienceTeslaFirst.vue";

export default {
  name: "experience",
  components: {
    Menu,
    ExperienceToyota,
    ExperienceTesla,
    ExperienceTeslaFirst,
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
