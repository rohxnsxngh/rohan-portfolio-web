<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-8xl sm:text-6xl text-3xl">Tesla.</h1>
      <p class="font-bold lg:text-4xl sm:text-2xl text-sm text-primary">
        Software Engineering Intern.
      </p>
      <p class="font-bold lg:text-2xl sm:text-lg text-xs text-slate-500">
        January 2022 - September 2022.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2 inline-block"
        onclick="tesla_experience_first.showModal()"
      >
      <i class="fi fi-bs-info mx-1 text-slate-500"></i>Learn More
      </button>
      <dialog id="tesla_experience_first" class="modal">
        <div class="modal-box w-11/12 max-w-5xl bg-primary-content">
          <div class="flex flex-col">
            <h1 class="font-bold md:text-4xl sm:text-2xl text-xl text-primary">Tesla.</h1>
            <div class="divider"></div>
            <div class="">
              <ul
                class="font-normal md:text-lg sm:text-md text-sm text-white h-fit list-disc list-outside"
              >
                <li>
                  Collaborated with software engineers to develop and test
                  application procedures for system efficiency.
                </li>
                <li>
                  Assisted in implementing a project tracking system that has
                  tracked over 30,000+ scopes worth over $300 million across
                  GigaTexas from start to finish. This system tracks labor,
                  reports spending, forecasts for funding, and has project
                  controls in place to identify work at risk.
                </li>
                <li>
                  Developed dashboards, reports, and other tools that provide
                  visibility and transparency to project productivity, progress,
                  changes, and KPI to ensure alignment with project goals by
                  utilizing web development and embedded Power BI.
                </li>
                <li>
                  Assisting the Texas Giga Factory BIM team who is responsible
                  for managing the digital model and data representations of the
                  factory and its productions assets used by engineering,
                  construction, manufacturing, and operations teams.
                </li>
                <li>
                  Providing design and construction coordination services aimed
                  at maximizing constructability, safety, maintainability, and
                  future factory expansion options. Implementing myriad of
                  technology and processes used to maintain all factory models
                  and their associated data in as close to real-time as
                  possible.
                </li>
                <li>
                  Using LIDAR scanning and reality capture with Cintoo to map
                  the factory and resolve clashes.
                </li>
                <div class="modal-action sm:w-1/4 w-full right-0 float-right">
                  <form method="dialog">
                    <!-- if there is a button in form, it will close the modal -->
                    <button
                      class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary float-right"
                    >
                      Close
                    </button>
                  </form>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </dialog>
    </div>
    <div class="">
      <div
        class="carousel carousel-center max-w-xl bg-primary-content rounded-box sm:h-1/2 h-96 border-2 border-primary hover:border-white"
      >
        <div class="carousel-item">
          <img
            id="tesla-first-item1"
            src="/Images/TeslaCyberRodeo.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-first-item2"
            src="/Images/TeslaRoadster.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-first-item3"
            src="/Images/TeslaModelYWrapped.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-first-item4"
            src="/Images/TeslaCyberTruck.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-first-item5"
            src="/Images/TeslaOptimus.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-first-item6"
            src="/Images/TeslaLiDARRainbow.png"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-first-item7"
            src="/Images/TeslaLiDARControlTargets.png"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-first-item8"
            src="/Images/TeslaFlyingY.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
      </div>
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a
          href="#tesla-first-item1"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-first-item2"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-first-item3"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-first-item4"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-first-item5"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-first-item6"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-first-item7"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-first-item8"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
    </div>
  </div>
</template>

<script></script>
