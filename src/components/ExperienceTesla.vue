<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold ml-2 lg:text-8xl sm:text-6xl text-3xl">Tesla.</h1>
      <p class="font-bold ml-2 lg:text-4xl sm:text-2xl text-sm text-primary">
        Software Engineering Intern.
      </p>
      <p class="font-bold ml-2 lg:text-2xl sm:text-lg text-xs text-slate-500">
        May 2023 - September 2023.
      </p>


      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary"
        onclick="tesla_experience.showModal()">Learn More</button>
      <dialog id="tesla_experience" class="modal">
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
      <div class="carousel carousel-center max-w-xl bg-primary-content rounded-box xs:h-1/2 h-full">
        <div class="carousel-item">
          <img id="tesla-item1" src="/Images/TeslaRobotics.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-item2" src="/Images/TeslaLight.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <!-- <img id="tesla-item3" src="/Images/TeslaMoreAesthetic.PNG" class="rounded-box object-cover scroll-mt-96" /> -->
        </div>
        <div class="carousel-item">
          <img id="tesla-item4" src="/Images/TeslaCrashDummySideView.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-item5" src="/Images/TeslaFDTDataDisplay.png" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-item6" src="/Images/TeslaMapWithConversion.png" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-item7" src="/Images/TeslaRevitExtractionServiceArchitecture.png" class="rounded-box object-cover scroll-mt-96" />
        </div>
        <div class="carousel-item">
          <img id="tesla-item8" src="/Images/TeslaCyberRodeoScreen.jpg" class="rounded-box object-cover scroll-mt-96" />
        </div>
      </div>
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a href="#tesla-item1" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-item2" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-item3" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-item4" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-item5" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-item6" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-item7" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
        <a href="#tesla-item8" class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"></a>
      </div>
    </div>
  </div>
</template>

<script>
// import hello from "/Images";
</script>
