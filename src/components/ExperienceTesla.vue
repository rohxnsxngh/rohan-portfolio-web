<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold ml-2 lg:text-8xl sm:text-6xl text-3xl">Tesla.</h1>
      <p class="font-bold ml-2 lg:text-4xl sm:text-2xl text-lg text-primary">
        Software Engineering Intern.
      </p>
      <p class="font-bold ml-2 lg:text-2xl sm:text-lg text-xs text-slate-500">
        May 2023 - September 2023.
      </p>


      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary"
        onclick="my_modal_1.showModal()">Learn More</button>
      <dialog id="my_modal_1" class="modal">
        <div class="modal-box w-11/12 max-w-5xl">
          <div class="flex flex-col">hello

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
          <img src="/Images/TeslaRobotics.jpg" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaLight.jpg" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaMoreAesthetic.PNG" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaCrashDummySideView.jpg" class="rounded-box object-contain" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaFDTDataDisplay.png" class="rounded-box object-cover" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaMapWithConversion.png" class="rounded-box object-contain" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaRevitExtractionServiceArchitecture.png" class="rounded-box object-contain" />
        </div>
        <div class="carousel-item">
          <img src="/Images/TeslaCyberRodeoScreen.jpg" class="rounded-box object-contain" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import hello from "/Images";
</script>
