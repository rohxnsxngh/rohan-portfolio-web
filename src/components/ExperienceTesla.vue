<template>
  <div class="flex justify-center items-center h-screen">
    <div
      class="card w-full glass bg-base-100 opacity-80 hover:opacity-100 image-full h-1/2"
    >
      <figure>
        <img src="../assets/teslaLogo.png" alt="tesla" />
      </figure>
      <div class="card-body">
        <h2 class="card-title text-2xl tablet:text-4xl">
          Software Engineering Intern
        </h2>
        <p class="tablet:text-xl text-lg">January. 2022 - September. 2022</p>
        <div class="card-actions justify-end">
          <label
            for="tesla-experience"
            class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-red-500 hover:border-black hover:text-red-500"
            >Learn More</label
          >
        </div>
      </div>
    </div>

    <!-- Put this part before </body> tag -->
    <div class="">
      <input type="checkbox" id="tesla-experience" class="modal-toggle" />
      <label for="tesla-experience" class="modal modal-middle cursor-pointer">
        <label class="modal-box bg-black glass max-w-screen mx-auto" for="">
          <h4
            class="text-center tablet:text-left text-xl font-bold tablet:text-2xl font-bold mb-4"
          >
            Software Engineering Intern @
            <strong class="text-2xl text-red-500 tablet:text-red-500"
              >Tesla</strong
            >
          </h4>
          <ul
            class="list-disc list-inside text-xs tablet:text-sm marker:text-red-500"
          >
            <li class="my-2">
              Collaborated with software engineers to develop and test
              application procedures for system efficiency.
            </li>
            <li class="my-2">
              Wrote clean Schema’s and used Flyway, an open source migration
              tool, to migrate versions into a database.
            </li>
            <li class="my-2">
              Designed sleek frontend UI/UX interface using Vue.js, Tailwind,
              Bootstrap, AG-Grid, ApexCharts, Three.js for a variety of
              projects.
            </li>
            <li class="my-2">
              Utilized state management with Vuex to create scalable organized
              code and centralized API/data-fetching logic.
            </li>
            <li class="my-2">
              Built REST API’s in .NET for multiple CRUD applications.
            </li>
            <li class="my-2">
              Assisting the Texas Giga Factory BIM team who is responsible for
              managing the digital model and data representations of the factory
              and its productions assets used by engineering, construction,
              manufacturing, and operations teams.
            </li>
            <li class="my-2">
              Providing design and construction coordination services aimed at
              maximizing constructibility, safety, maintainability, and future
              factory expansion options. Implementing myriad of technology and
              processes used to maintain all factory models and their associated
              data in as close to real-time as possible.
            </li>
            <li class="my-2">
              Using LIDAR scanning and reality capture with Cintoo to map the
              factory and resolve clashes.
            </li>
            <p style="color: white">
              <strong class="text-sm text-red-500 tablet:text-red-500"
                >Tech Stack & Tools:</strong
              >
              .NET, Vue.js, PostgreSQL, Tailwind CSS, Three.js, Docker, WebGL,
              Python, SolidWorks, Revit
            </p>
          </ul>
          <div class="modal-action">
            <label
              for="tesla-experience"
              class="btn btn-sm text-black bg-white border-2 border-red-500 hover:border-black hover:text-red-500"
              >close</label
            >
          </div>
        </label>
      </label>
    </div>
  </div>
</template>
