<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-4xl sm:text-4xl text-xl">
        Strandbeest Robot.
      </h1>
      <p class="font-bold lg:text-2xl sm:text-2xl text-lg text-primary">
        Texas A&M University Robotics.
      </p>
      <p class="font-bold lg:text-xl sm:text-md text-xs text-slate-500">
        August 2020 - May 2023.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2"
        onclick="strandbeest_project.showModal()"
      >
        Learn More
      </button>
      <dialog id="strandbeest_project" class="modal">
        <div class="modal-box w-11/12 max-w-5xl bg-primary-content">
          <div>
            <h1 class="font-bold text-xl text-primary">
              Strandbeest Robot
                   <div class="divider"></div>
              <p class="font-normal text-sm text-white">
                Although humans primarily use wheeled vehicles for ground transportation, it's worth noting that there are no biological creatures in nature that move on wheels. Instead, living creatures use legs or crawl to navigate the ground. Walking, as a means of locomotion, offers numerous advantages over wheel locomotion, including lower energy consumption, greater flexibility in traversing obstacles, less damage to the ground, and no requirement for roads (Moldovan et al., 2011). As a result, scientists are actively designing vehicles inspired by natural locomotion, with legs being one of the most popular choices. For example, Dutch physicist and artist Theo Jansen has developed a twelve-bar mechanism for legs in his kinetic sculptures (Jansen, 2007), which is now known as the "Theo Jansen linkage" and can be adapted for use in walking vehicles. This project aimed to design and build a Strandbeest robot, inspired by the Theo Jansen linkage mechanism. By utilizing legs instead of wheels, this robot enjoys several benefits, including lower energy consumption, greater maneuverability, and the ability to overcome obstacles with ease.
          <div class="modal-action h-6">
            <form method="dialog">
              <!-- if there is a button, it will close the modal -->
              <button class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary">Close</button>
            </form>
          </div>
              </p>
            </h1>
          </div>
        </div>
      </dialog>
    </div>
    <div class="px-2">
      <div
        class="carousel carousel-center max-w-xl bg-neutral rounded-box sm:h-1/2 h-80"
      >
        <div class="carousel-item">
          <img
            src="/Images/strandbeestCAD.png"
            class="rounded-box object-cover"
            id="item1-sb"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/StrandbeestMotion.gif"
            class="rounded-box object-cover"
            id="item2-sb"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/StrandbeestPrototype.png"
            class="rounded-box object-scale-down"
            id="item3-sb"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/StrandBeestLinkagesMath.png"
            class="rounded-box object-contain"
            id="item4-sb"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/StrandbeestLinkagesDrawing.png"
            class="rounded-box object-contain"
            id="item5-sb"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/StrandbeestElectronicsDiagram.png"
            class="rounded-box object-contain"
            id="item6-sb"
          />
        </div>
      </div>
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a
          href="#item1-sb"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item2-sb"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item3-sb"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item4-sb"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item5-sb"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item6-sb"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
    </div>
  </div>
</template>
