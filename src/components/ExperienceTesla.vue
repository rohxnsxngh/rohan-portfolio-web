<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-8xl sm:text-6xl text-3xl">Tesla.</h1>
      <p class="font-bold lg:text-4xl sm:text-2xl text-sm text-primary">
        Software Engineering Intern.
      </p>
      <p class="font-bold lg:text-2xl sm:text-lg text-xs text-slate-500">
        May 2023 - September 2023.
      </p>

      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2 inline-block"
        onclick="tesla_experience.showModal()"
      >
        <i class="fi fi-bs-info mx-1 text-slate-500"></i>Learn More
      </button>
      <dialog id="tesla_experience" class="modal">
        <div class="modal-box h-fit w-11/12 max-w-5xl bg-primary-content">
          <div class="flex flex-col">
            <h1 class="font-bold md:text-4xl sm:text-2xl text-xl text-primary">Tesla.</h1>
            <div class="divider"></div>
            <div class="">
              <ul
                class="font-normal md:text-lg sm:text-md text-sm text-white h-fit list-disc list-outside"
              >
                <li class="text-primary">
                  <div class="text-white">
                    Automated and optimized Revit model extraction, reducing
                    manual tasks from 12 hours to minutes and processing 20-25
                    Revit models in 50 minutes, all while maintaining
                    scalability and cost-efficiency.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Developed a robust, user-friendly tool featuring automatic
                    synchronization, error logging, persistent background jobs,
                    and a custom frontend with real-time status updates on the
                    Revit extraction tool, enhancing accessibility and
                    transparency for users.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Employed alternative to Autodesk Forge Flex tokens for
                    cost-effective operation, managing expenses at $30/day per
                    token, resulting in potential annual cost savings ranging
                    from $163,800 (15 tokens) to $491,400 (45 tokens) for
                    minimal usage, while ensuring scalability with increased
                    factory projects.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Assisted development of a cutting-edge tracking service
                    utilizing Golang and leveraging the Ericsson network's 5G
                    capabilities to monitor and optimize the real-time movements
                    of AGVs, cranes, vehicles, and other assets, enhancing
                    operational efficiency and asset management.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Provided comprehensive frontend development support using
                    ReactJS, Python, and Deck.gl to visualize the data extracted
                    by the Revit extraction tool, seamlessly transforming it
                    into GeoJSON format and rendering it in a dynamic 3D
                    display, enhancing data visualization and user interaction.
                  </div>
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
        class="carousel carousel-center max-w-4xl bg-primary-content rounded-box sm:h-1/2 h-96 border-2 border-primary hover:border-white"
      >
        <div class="carousel-item">
          <img
            id="tesla-item1"
            src="/Images/TeslaRobotics.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-item2"
            src="/Images/TeslaLight.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-item3"
            src="/Images/TeslaAestheticsFDT.png"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-item4"
            src="/Images/TeslaCrashDummySideView.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-item5"
            src="/Images/TeslaFDTDataDisplay.png"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-item6"
            src="/Images/TeslaMapWithConversion.png"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-item7"
            src="/Images/TeslaRevitExtractionServiceArchitecture.png"
            class="rounded-box object-scale-down scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="tesla-item8"
            src="/Images/TeslaCyberRodeoScreen.jpg"
            class="rounded-box object-cover scroll-mt-96"
          />
        </div>
      </div>
      <div
        class="w-full justify-center flex text-xs px-2 h-2 gap-1"
        id="img-navigation-tesla"
      >
        <a
          href="#tesla-item1"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-item2"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-item3"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-item4"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-item5"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-item6"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-item7"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#tesla-item8"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    document
      .getElementById("img-navigation-tesla")
      .addEventListener("click", this.handleNavigationClick);
  },
  methods: {
    handleNavigationClick(event) {
      event.preventDefault()
      // Use smooth scrolling to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // You can add your own logic here if needed
    },
  },
};
</script>
