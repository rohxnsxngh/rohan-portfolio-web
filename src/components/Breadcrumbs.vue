<!-- Breadcrumbs.vue -->
<template>
  <div class="flex text-sm rounded-lg" aria-label="Breadcrumb">
    <ul class="flex items-center space-x-4 timeline">
      <!-- <li v-for="(page, index) in pages" :key="index">
        <button
          :id="page.id"
          class="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          {{ page.text }}
        </button>
      </li> -->
      <li v-for="(page, index) in pages" :key="index" class="w-24 h-24">
        <div class="timeline-start">1984</div>
        <div class="timeline-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="timeline-end timeline-box">
          <button
            :id="page.id"
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            {{ page.text }}
          </button>
        </div>
        <hr />
      </li>
    </ul>
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
