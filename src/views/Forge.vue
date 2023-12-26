<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 opacity-65 text-4xl rounded-lg opacity-90"
    id="forge-panel"
    @click="handleDivClick"
  >
    <div class="flex flex-col">
      <div class="top-0 m-2">
        <Menu />
      </div>
      <div class="inset-0 mb-48">
        <div
          role="tablist"
          class="tabs tabs-lifted lg:tabs-lg sm:tabs-sm tabs-xs bg-primary-content"
        >
          <!-- Research -->
          <input
            type="radio"
            name="my_tabs_3"
            role="tab"
            class="tab hover:bg-primary hover:text-white font-semibold"
            aria-label="Research"
            checked
          />
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
            <ForgeResearch />
          </div>
          <!-- Hans and Aubs -->
          <input
            type="radio"
            name="my_tabs_3"
            role="tab"
            class="tab hover:bg-primary hover:text-white font-semibold"
            aria-label="Graphics"
          />
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
            <ForgeGraphics />
          </div>
          <!-- Tesla -->
          <input
            type="radio"
            name="my_tabs_3"
            role="tab"
            class="tab hover:bg-primary hover:text-white font-semibold"
            aria-label="Strandbeest"
          />
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
            <ForgeStrandbeest />
          </div>
          <input
            type="radio"
            name="my_tabs_3"
            role="tab"
            class="tab hover:bg-primary hover:text-white font-semibold"
            aria-label="Maze"
          />
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
            <ForgeMaze />
          </div>
          <input
            type="radio"
            name="my_tabs_3"
            role="tab"
            class="tab hover:bg-primary hover:text-white font-semibold"
            aria-label="ML/AI"
          />
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
            <ForgeMachineLearning />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Menu from "../components/Menu.vue";
import ForgeResearch from "../components/ForgeResearch.vue";
import ForgeGraphics from "../components/ForgeGraphics.vue";
import ForgeStrandbeest from "../components/ForgeStrandbeest.vue";
import ForgeMachineLearning from "../components/ForgeMachineLearning.vue";
import ForgeMaze from "../components/ForgeMaze.vue";

export default {
  name: "experience",
  components: {
    Menu,
    ForgeResearch,
    ForgeGraphics,
    ForgeStrandbeest,
    ForgeMachineLearning,
    ForgeMaze,
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
