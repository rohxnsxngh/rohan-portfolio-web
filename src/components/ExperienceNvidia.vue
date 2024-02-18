<template>
  <div
    class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2 overflow-hidden"
  >
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-8xl sm:text-6xl text-3xl">Nvidia.</h1>
      <p class="font-bold lg:text-4xl sm:text-2xl text-sm text-primary">
        Computer Aided Design Engineer Intern.
      </p>
      <p class="font-bold lg:text-2xl sm:text-lg text-xs text-slate-500">
        May 2021 - August 2021.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2 inline-block"
        onclick="nvidia_experience.showModal()"
      >
        <i class="fi fi-bs-info mx-1 text-slate-500"></i>Learn more
      </button>
      <dialog id="nvidia_experience" class="modal">
        <div class="modal-box h-fit w-11/12 max-w-5xl bg-primary-content">
          <div class="flex flex-col">
            <h1
              class="font-bold md:text-4xl sm:text-2xl text-xl text-primary h-fit"
            >
              Nvidia.
            </h1>
            <div class="divider divider-primary"></div>
            <div class="">
              <ul
                class="font-normal md:text-lg sm:text-md text-sm text-white h-fit list-disc list-outside"
              >
                <li class="text-primary">
                  <div class="text-white">
                    Developed and implemented C++ scripts to automate tasks
                    within CAD software, improving efficiency and productivity
                    by 15%.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Applied Geometric Dimensioning and Tolerancing (GD&T)
                    principles to ensure accurate representation of tolerances
                    and dimensions in CAD models and drawings.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Incorporated Design for Manufacturability (DFM) principles
                    into CAD design processes, optimizing designs for efficient
                    and cost-effective manufacturing.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Built detailed 3D models of equipment and data center
                    layouts, ensuring precision and adherence to project
                    specifications.
                  </div>
                </li>
                <li class="text-primary">
                  <div class="text-white">
                    Proficient in utilizing industry-standard 3D CAD software,
                    including Creo, Windchill, SolidWorks, and Fusion 360, for
                    designing and modeling complex mechanical systems and
                    components.
                  </div>
                </li>
              </ul>
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
            </div>
          </div>
        </div>
      </dialog>
    </div>
    <div class="">
      <div
        class="carousel carousel-center max-w-4xl bg-primary-content sm:h-1/2 h-96 rounded-box focus-within:p-2 border-2 border-primary hover:border-white"
      >
        <div class="carousel-item">
          <img
            id="nvidia-item1"
            src="/Images/NvidiaLogo.png"
            class="rounded-box object-contain scroll-mt-96"
          />
        </div>
        <div class="carousel-item">
          <img
            id="nvidia-item2"
            src="/Images/NvidiaCAD.png"
            class="rounded-box object-contain scroll-mt-96"
          />
        </div>
      </div>

      <!-- <input type="range" min="0" max="100" value="0" class="range range-xs" step="50" /> -->
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a
          href="#nvidia-item1"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#nvidia-item2"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
    </div>
  </div>
</template>
