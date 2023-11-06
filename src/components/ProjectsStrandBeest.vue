<template>
  <div class="flex justify-center items-center h-screen laptop:h-full">
    <div class="card w-full bg-black opacity-80 hover:opacity-100 image-full h-3/4 object-cover">
      <figure>
        <img src="../assets/strandbeestCAD.png" alt="strandbeest" />
      </figure>
      <div class="card-body">
        <h2 class="card-title text-2xl tablet:text-4xl">StrandBeest</h2>
        <p class="tablet:text-xl text-lg">Ongoing</p>
        <div class="card-actions justify-end">
          <label
            for="strandbeest-project"
            class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-teal-500 hover:border-black hover:text-teal-500"
            >Learn More</label
          >
        </div>
      </div>
    </div>

    <!-- Put this part before </body> tag -->
    <div class="">
      <input type="checkbox" id="strandbeest-project" class="modal-toggle" />
      <label for="strandbeest-project" class="modal cursor-pointer">
        <label class="modal-box bg-black glass max-w-screen mx-auto" for="">
          <h4
            class="text-center text-fuschia-700 tablet:text-left text-xl font-bold tablet:text-2xl font-bold mb-4"
          >
            StrandBeest
          </h4>
          <p class="text-xs tablet:text-sm">
            Although humans primarily use wheeled vehicles for ground
            transportation, it's worth noting that there are no biological
            creatures in nature that move on wheels. Instead, living creatures
            use legs or crawl to navigate the ground. Walking, as a means of
            locomotion, offers numerous advantages over wheel locomotion,
            including lower energy consumption, greater flexibility in
            traversing obstacles, less damage to the ground, and no requirement
            for roads (Moldovan et al., 2011). As a result, scientists are
            actively designing vehicles inspired by natural locomotion, with
            legs being one of the most popular choices. For example, Dutch
            physicist and artist Theo Jansen has developed a twelve-bar
            mechanism for legs in his kinetic sculptures (Jansen, 2007), which
            is now known as the "Theo Jansen linkage" and can be adapted for use
            in walking vehicles. This project aimed to design and build a
            Strandbeest robot, inspired by the Theo Jansen linkage mechanism. By
            utilizing legs instead of wheels, this robot enjoys several
            benefits, including lower energy consumption, greater
            maneuverability, and the ability to overcome obstacles with ease.
          </p>
          <div class="modal-action">
            <label
              for="strandbeest-project"
              class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-teal-500 hover:border-black hover:text-teal-500"
              >close</label
            >
          </div>
        </label>
      </label>
    </div>
  </div>
</template>
