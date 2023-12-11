<!-- Breadcrumbs.vue -->
<template>
  <div class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-4">
      <li v-for="(page, index) in pages" :key="index">
        <button
          :id="page.id"
          class="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          {{ page.text }}
        </button>
      </li>
    </ol>
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
