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
          <img id="tesla-first-item1" src="/Images/TeslaCyberRodeo.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-first-item2" src="/Images/TeslaRoadster.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-first-item3" src="/Images/TeslaModelYWrapped.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-first-item4" src="/Images/TeslaCyberTruck.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-first-item5" src="/Images/TeslaOptimus.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-first-item6" src="/Images/TeslaLiDARRainbow.png" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-first-item7" src="/Images/TeslaLiDARControlTargets.png" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-first-item8" src="/Images/TeslaFlyingY.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
      </div>
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a href="#tesla-first-item1" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-first-item2" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-first-item3" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-first-item4" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-first-item5" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-first-item6" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-first-item7" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-first-item8" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
      </div>
    </div>
  </div>
</template>

<script></script>
