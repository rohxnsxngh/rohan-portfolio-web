<template>
  <div class="block touch-pan-y">
    <section class="block section fade-section" id="home">
      <Home />
      <br />
    </section>
  </div>
</template>

<script>
import Home from "./components/Home.vue";

export default {
  name: "home",
  components: {
    Home,
  },
  data() {
    return {
      observer: null,
    };
  },
  mounted() {
    // Define options for the Intersection Observer
    const options = {
      root: null, // Use the viewport as the root element
      rootMargin: "0px", // No margin around the root element
      threshold: 0.3, // Trigger when 30% of the section is visible
    };

    // Create a new Intersection Observer instance
    this.observer = new IntersectionObserver(this.handleIntersection, options);

    // Get all the sections with the fade-section class
    const sections = document.querySelectorAll(".fade-section");

    // Observe each section
    sections.forEach((section) => {
      this.observer.observe(section);
    });
  },
  methods: {
    handleIntersection(entries) {
      // Loop through all the entries that have intersected the viewport
      entries.forEach((entry) => {
        const target = entry.target; // Get the observed element

        // Check if the observed element has entered or left the viewport
        if (entry.isIntersecting) {
          // Add the "is-visible" class to trigger the fade in effect
          target.classList.add("is-visible");
        } else {
          // Remove the "is-visible" class to trigger the fade out effect
          target.classList.remove("is-visible");
        }
      });
    },
  },
};
</script>

<style scoped>
.fade-section {
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.is-visible {
  opacity: 1;
}
</style>
