<!-- Breadcrumbs.vue -->
<template>
  <div class="btm-nav sm:ntm-nav-sm btm-nav-xs bg-primary-content" aria-label="Breadcrumb">
    <button
      v-for="(page, index) in pages"
      :key="index"
      :id="page.id"
      :class="['text-xs bg-primary-content text-gray-400 hover:text-white focus:outline-none', { 'active': index === pages.length - 1 }]"
    >
      {{ page.text }}
    </button>
  </div>
</template>

<script>
export default {
  name: "Breadcrumbs",
  props: {
    pages: {
      type: Array,
      required: true,
    },
  },
};
</script>
