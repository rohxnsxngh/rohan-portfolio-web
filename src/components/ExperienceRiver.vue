<template>
  <div>
    <div class="flex justify-center items-center">
      <h1
        class="text-4xl text-center underline decoration-8 decoration-sky-800/[.60] font-bold tablet:text-8xl text-white hover:scale-75 transition duration-700"
      >
        Experiences
      </h1>
    </div>
  </div>

  <div class="flex justify-center items-center h-screen">
    <div
      class="card w-full glass bg-base-100 opacity-80 hover:opacity-100 image-full h-1/2"
    >
      <figure>
        <img src="../assets/riverProjectLogo.png" alt="river" class="h-1/2" />
      </figure>
      <div class="card-body">
        <h2 class="card-title text-2xl tablet:text-4xl">
          Software Engineering Intern
        </h2>
        <p class="tablet:text-xl text-lg">September 2022 - January 2023</p>
        <div class="card-actions justify-end">
          <label
            for="river-experience"
            class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-sky-500 hover:border-black hover:text-sky-500"
            >Learn More</label
          >
        </div>
      </div>
    </div>

    <!-- Put this part before </body> tag -->
    <div class="">
      <input type="checkbox" id="river-experience" class="modal-toggle" />
      <label for="river-experience" class="modal cursor-pointer">
        <label class="modal-box bg-black glass max-w-screen mx-auto" for="">
          <h4
            class="text-center tablet:text-left text-xl font-bold tablet:text-2xl font-bold mb-4"
          >
            Software Engineering Intern @
            <strong class="text-2xl text-regal-blue tablet:text-regal-blue"
              >RiverProject</strong
            >
          </h4>
          <ul class="list-disc list-inside text-xs tablet:text-sm marker:text-regal-blue">
            <li class="my-2">
              Provided software and hardware troubleshooting to maintain
              performance levels.
            </li>
            <li class="my-2">
              Collaborated with software engineers to develop and test REST API
              in Rust and create data models and migrations for a centralized
              database.
            </li>
            <li class="my-2">
              Wrote clear, clean code in Vue.js and Tailwind to help develop
              RiverProject.io company homepage.
            </li>
            <li class="my-2">
              Collaborated effectively with members of software development team
              and personnel in other departments.
            </li>
            <li class="my-2">
              Built Mock REST API’s in Express.js for human resourcing and
              designed employee management homepage in Vue.js with typescript
              and Frontend authentification integration
            </li>
            <li class="my-2">
              Implemented of our logging, metrics, alerting, and load testing
              with Grafana loki, mimir and k6 solutions for development of
              discord bot
            </li>
            <p>
              <strong
                class="text-xs sm:text-sm text-regal-blue tablet:text-regal-blue"
                >Tech Stack & Tools:</strong
              >
              Rust, Vue.js, Typescript, PostgreSQL, Tailwind CSS, Grafani loki,
              Mimir
            </p>
          </ul>
          <div class="modal-action">
            <label
              for="river-experience"
              class="btn btn-sm text-black bg-white border-2 border-sky-500 hover:border-black hover:text-sky-500"
              >close</label
            >
          </div>
        </label>
      </label>
    </div>
  </div>
</template>
