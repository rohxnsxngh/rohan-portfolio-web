<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold ml-2 lg:text-8xl sm:text-6xl text-3xl">Tesla.</h1>
      <p class="font-bold ml-2 lg:text-4xl  sm:text-2xl text-sm text-primary">
        Software Engineering Intern.
      </p>
      <p class="font-bold ml-2 lg:text-2xl sm:text-lg text-xs text-slate-500">
        January 2022 - September 2022.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary"
        onclick="tesla_experience_first.showModal()">Learn More</button>
      <dialog id="tesla_experience_first" class="modal">
        <div class="modal-box w-11/12 max-w-5xl">
          <div class="flex flex-col">Tesla Contributions

            <div class="modal-action sm:w-1/4 w-full right-0 float-right">
              <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <button
                  class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary float-right">Close</button>
              </form>
            </div>
          </div>

        </div>
      </dialog>
    </div>
    <div class="px-2">
      <div class="carousel carousel-center max-w-xl bg-primary-content rounded-box h-1/2">
        <div class="carousel-item">
          <img src="/Images/TeslaCyberRodeo.jpg" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaRoadster.jpg" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaModelYWrapped.jpg" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaCyberTruck.jpg" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaOptimus.jpg" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaLiDARRainbow.png" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaLiDARControlTargets.png" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaFlyingY.jpg" class="rounded-box object-cover" />
        </div>
      </div>
    </div>
  </div>
</template>

<script></script>
