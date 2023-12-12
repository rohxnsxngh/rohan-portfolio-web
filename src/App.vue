<template>
  <Init/>
  <Navigation />
  <Forge />
  <Experience />
  <About />
  <Writing />
  <Contact />
</template>

<script>
import Navigation from "./views/Navigation.vue";
import Forge from "./views/Forge.vue";
import Experience from "./views/Experience.vue";
import About from "./views/About.vue";
import Writing from "./views/Writing.vue";
import Contact from "./views/Contact.vue";
import Init from "./views/Init.vue";

export default {
  name: "home",
  components: {
    Navigation,
    Forge,
    Experience,
    About,
    Writing,
    Contact,
    Init
  },
  data() {
    return {
      observer: null,
    };
  },
  methods: {
    handleDivClick() {
      console.log("Hello");
      // You can perform additional actions here
    },
  },
};
</script>
