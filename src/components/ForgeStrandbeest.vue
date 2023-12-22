<template>
    <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
      <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
        <h1 class="font-bold lg:text-4xl sm:text-4xl text-2xl">
          Strandbeest Robotics.
        </h1>
        <p class="font-bold lg:text-2xl sm:text-2xl text-lg text-primary">
          Texas A&M University Robotics.
        </p>
        <p class="font-bold lg:text-xl sm:text-md text-xs text-slate-500">
          August 2020 - May 2023.
        </p>
        <button
          class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary"
          onclick="strandbeest_project.showModal()"
        >
          Learn More
        </button>
        <dialog id="strandbeest_project" class="modal">
          <div class="modal-box w-11/12 max-w-5xl">
            <div class="flex flex-col">
              Texas A&M University Robotics Team & Leadership Experience (TURTLE)
  
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
        </dialog>
      </div>
      <div class="px-2">
        <div
          class="carousel carousel-center max-w-xl bg-neutral rounded-box sm:h-1/2 h-80"
        >
          <div class="carousel-item">
            <!-- <img
              src="/Images/ResearchCustomStrats.jpg"
              class="rounded-box object-cover"
            /> -->
          </div>
        </div>
      </div>
    </div>
  </template>
  