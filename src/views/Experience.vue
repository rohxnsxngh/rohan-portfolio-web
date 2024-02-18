<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 opacity-55 text-4xl rounded-lg"
    id="experience-panel"
  >
    <div class="flex flex-col">
      <div class="top-0 m-2 h-fit">
        <Menu />
      </div>
      <div class="inset-0 mb-48">
        <div
          role="tablist"
          class="tabs tabs-lifted lg:tabs-lg sm:tabs-sm tabs-xs bg-primary-content self-center"
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
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
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
            class="tab hover:bg-primary hover:text-white font-semibold"
            aria-label="Tesla"
          />
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
            <ExperienceTeslaFirst />
          </div>
          <!-- Nvidia -->
          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            class="tab hover:bg-primary hover:text-white font-semibold"
            aria-label="Nvidia"
          />
          <div
            role="tabpanel"
            class="tab-content bg-primary-content rounded-box"
          >
            <ExperienceNvidia />
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
import ExperienceNvidia from "../components/ExperienceNvidia.vue";

export default {
  name: "experience",
  components: {
    Menu,
    ExperienceToyota,
    ExperienceTesla,
    ExperienceTeslaFirst,
    ExperienceNvidia,
  },
};
</script>
