<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 opacity-90 text-4xl rounded-lg opacity-90"
    id="forge-panel" @click="handleDivClick">
    <div class="flex flex-col">
      <div>
        <Menu />
      </div>
      <div role="tablist" class="tabs tabs-lifted lg:tabs-lg sm:tabs-sm tabs-xs bg-primary-content">
        <!-- Toyota -->
        <input type="radio" name="my_tabs_3" role="tab" class="tab hover:bg-primary hover:text-white font-semibold"
          aria-label="Toyota" checked />
        <div role="tabpanel" class="tab-content bg-primary-content rounded-box">
          <ForgeResearch />
        </div>
        <!-- Tesla -->
        <input type="radio" name="my_tabs_3" role="tab" class="tab hover:bg-primary hover:text-white font-semibold"
          aria-label="Tesla" />
        <div role="tabpanel" class="tab-content bg-primary-content rounded-box">
          <!-- <ForgeResearch /> -->
          hello
        </div>
        <!-- Tesla -->
        <input type="radio" name="my_tabs_3" role="tab" class="tab hover:bg-primary hover:text-white font-semibold"
          aria-label="Tesla" />
        <div role="tabpanel" class="tab-content bg-primary-content rounded-box">
          <!-- <ForgeResearch /> -->
          hello 2
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Menu from "../components/Menu.vue";
import ForgeResearch from "../components/ForgeResearch.vue";

export default {
  name: "experience",
  components: {
    Menu,
    ForgeResearch
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
