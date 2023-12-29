<template>
  <Init />
  <Navigation />
  <Experience />
  <Forge />
  <About />
  <Writing />
  <Contact />
  <Credits/>
  <Finish />
</template>

<script>
import Navigation from "./views/Navigation.vue";
import Forge from "./views/Forge.vue";
import Experience from "./views/Experience.vue";
import About from "./views/About.vue";
import Writing from "./views/Writing.vue";
import Contact from "./views/Contact.vue";
import Init from "./views/Init.vue";
import Credits from "./views/Credits.vue";
import Finish from "./views/Finish.vue";

export default {
  name: "home",
  components: {
    Navigation,
    Forge,
    Experience,
    About,
    Writing,
    Contact,
    Init,
    Credits,
    Finish
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
