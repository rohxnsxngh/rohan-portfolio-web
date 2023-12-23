<template>
  <div
    class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2 overflow-hidden"
  >
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-8xl sm:text-6xl text-3xl">Toyota.</h1>
      <p class="font-bold lg:text-4xl sm:text-2xl text-sm text-primary">
        Software Systems Engineer.
      </p>
      <p class="font-bold lg:text-2xl sm:text-lg text-xs text-slate-500">
        September 2023 - Current.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2"
        onclick="toyota_experience.showModal()"
      >
        Learn More
      </button>
      <dialog id="toyota_experience" class="modal">
        <div class="modal-box w-11/12 max-w-5xl bg-primary-content">
          <div class="flex flex-col">
            Toyota Contributions

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
        class="carousel carousel-center max-w-xl bg-primary-content sm:h-1/2 h-80 rounded-box focus-within:p-2"
      >
        <div class="carousel-item">
          <img
            id="item1"
            src="/Images/ToyotaConceptCar.jpeg"
            class="rounded-box object-cover"
          />
        </div>
        <div class="carousel-item">
          <img
            id="item2"
            src="/Images/ToyotaHeadquarters.jpg"
            class="rounded-box object-cover"
          />
        </div>
        <div class="carousel-item">
          <img
            id="item3"
            src="/Images/LexusConceptCar.jpg"
            class="rounded-box object-cover"
          />
        </div>
      </div>

      <!-- <input type="range" min="0" max="100" value="0" class="range range-xs" step="50" /> -->
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a
          href="#item1"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item2"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item3"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
    </div>
  </div>
</template>
