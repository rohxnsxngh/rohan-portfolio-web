<template>
  <div>
    <div class="flex justify-center items-center">
      <h1
        class="text-4xl text-center underline decoration-8 decoration-sky-800/[.60] font-bold tablet:text-8xl text-white mb-10 hover:scale-75 transition duration-700"
      >
        Projects
      </h1>
    </div>
  </div>


  <!-- <div class="flex justify-center items-center h-screen laptop:h-full">
    <div class="card glass w-full hover:opacity-95">
      <div class="card-body">
        <div class="sm:flex sm:justify-between">
          <h2 class="text-fuchsia-700 card-title text-2xl tablet:text-4xl">
            The Forge
          </h2>
          <div class="card-actions hidden sm:flex">
            <label
              for="forge-project"
              class="ml-auto btn btn-xs sm:btn-sm text-black bg-white border-2 border-fuchsia-700 hover:border-black hover:text-fuchsia-700"
              >Learn More</label
            >
          </div>
        </div>
        <div
          class="carousel carousel-center glass max-w p-4 space-x-4 bg-black rounded-box hidden sm:flex"
        >
          <div class="carousel-item snap-x carousel-end w-full">
            <div class="snap-center">
              <img
                src="../assets/forgeScreen.png"
                class="rounded-box object-fit"
              />
            </div>
          </div>
          <div class="carousel-item carousel-end w-full">
            <div class="snap-center">
              <img
                src="../assets/forgeScreen1.png"
                class="rounded-box object-fit"
              />
            </div>
          </div>
          <div class="carousel-item carousel-end w-full">
            <div class="snap-center">
              <img
                src="../assets/forgeScreen2.png"
                class="rounded-box object-fit"
              />
            </div>
          </div>
          <div class="carousel-item carousel-end w-full">
            <div class="snap-center">
              <img
                src="../assets/forgeScreen3.png"
                class="rounded-box object-fit"
              />
            </div>
          </div>
        </div>

        <div
          class="h-96 glass max-w p-4 space-y-4 snap-mandatory snap-y carousel carousel-vertical overflow-auto rounded-box block sm:hidden"
        >
          <div class="carousel-item object-fit snap-center">
            <img src="../assets/forgeScreen.png" />
          </div>
          <div class="carousel-item object-fit snap-center">
            <img src="../assets/forgeScreen1.png" />
          </div>
          <div class="carousel-item object-fit snap-center">
            <img src="../assets/forgeScreen2.png" />
          </div>
          <div class="carousel-item object-fit snap-center">
            <img src="../assets/forgeScreen3.png" />
          </div>
        </div>

        <div class="card-actions flex sm:hidden justify-end mt-2">
          <label
            for="forge-project"
            class="ml-auto btn btn-xs sm:btn-sm text-black bg-white border-2 border-fuchsia-700 hover:border-black hover:text-fuchsia-700"
            >Learn More</label
          >
        </div>
      </div>
    </div>

    <div class="">
      <input type="checkbox" id="forge-project" class="modal-toggle" />
      <label for="forge-project" class="modal cursor-pointer">
        <label class="modal-box bg-black glass max-w-screen mx-auto" for="">
          <h4
            class="text-center tablet:text-left text-xl font-bold tablet:text-2xl font-bold mb-4"
          >
            The Forge
            <br />
            <a
              href="https://rohxnsxngh.vercel.app/"
              class="text-xs tablet:text-sm text-fuchsia-700 hover:underline"
              >demo
              <p class="text-white text-xs tablet:text-sm">
                (not mobile friendly)
              </p></a
            >
          </h4>
          <ul class="text-xs tablet:text-sm">
            <li>
              This project is an immersive, entertaining experience that allows
              users to interact with dynamic and engaging visuals. It was built
              as a platform for experimenting with various techniques in
              computer graphics and audio processing, such as audio visualizers,
              shaders, procedural generation, and textures. The project is built
              primarily with Three.js, a JavaScript library for creating and
              displaying 3D graphics on web browsers. The project aims to
              leverage the power of Three.js to create a rich, interactive and
              visually stunning experience for the user. It utilizes audio input
              to drive the animation and visuals of the scene, creating a
              real-time audio visualization. It also uses 3D models created in
              Blender and exported to be displayed in the browser. Procedural
              generation techniques are used to create unique and varied visuals
              with each experience, giving the user a different experience every
              time. This includes generating textures and shapes, which change
              depending on user interaction, or with the audio input. The
              project also makes use of shaders, which are small programs that
              run on the graphics processing unit (GPU) to generate the final
              images rendered on the screen. These shaders allow for complex and
              dynamic visuals, such as reflections, refractions, and realistic
              lighting effects. Finally, the project utilizes browser based
              technologies, the user can enjoy the immersive experience from
              anywhere and any device with a web browser and internet
              connection. The goal of the project is to provide an entertaining
              and engaging experience for the user, whether for entertainment or
              for other purposes such as gaming, music and other immersive
              experiences. This project is in development and has no real end
              goal as it's simply a method for artistic expression.
            </li>
          </ul>
          <div class="modal-action">
            <label
              for="forge-project"
              class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-fuchsia-700 hover:border-black hover:text-fuchsia-700"
              >close</label
            >
          </div>
        </label>
      </label>
    </div>
  </div> -->

  <div class="flex justify-center items-center h-screen laptop:h-full">
    <div
      class="card w-full bg-black opacity-80 hover:opacity-100 image-full h-3/4"
    >
      <figure>
        <img src="../assets/forgeScreen.png" alt="river" class="h-1/2" />
      </figure>
      <div class="card-body">
        <h2 class="card-title text-2xl tablet:text-4xl">
          The Forge
        </h2>
        <p class="tablet:text-xl text-lg">Ongoing</p>
        <div class="card-actions justify-end">
          <label
            for="forge-project"
            class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-fuchsia-500 hover:border-black hover:text-fuchsia-500"
            >Learn More</label
          >
        </div>
      </div>
    </div>

    <!-- Put this part before </body> tag -->
    <div class="">
      <input type="checkbox" id="forge-project" class="modal-toggle" />
      <label for="forge-project" class="modal cursor-pointer">
        <label class="modal-box bg-black glass max-w-screen mx-auto" for="">
          <h4
            class="text-center text-fuschia-700 tablet:text-left text-xl font-bold tablet:text-2xl font-bold mb-4"
          >
            The Forge
            <br />
            <a
              href="https://rohxnsxngh.vercel.app/"
              class="text-xs tablet:text-sm text-fuchsia-700 hover:underline"
              >demo
              <p class="text-white text-xs tablet:text-sm">
                (not mobile friendly)
              </p></a
            >
          </h4>
          <p class="text-xs tablet:text-sm">
              This project is an immersive, entertaining experience that allows
              users to interact with dynamic and engaging visuals. It was built
              as a platform for experimenting with various techniques in
              computer graphics and audio processing, such as audio visualizers,
              shaders, procedural generation, and textures. The project is built
              primarily with Three.js, a JavaScript library for creating and
              displaying 3D graphics on web browsers. The project aims to
              leverage the power of Three.js to create a rich, interactive and
              visually stunning experience for the user. It utilizes audio input
              to drive the animation and visuals of the scene, creating a
              real-time audio visualization. It also uses 3D models created in
              Blender and exported to be displayed in the browser. Procedural
              generation techniques are used to create unique and varied visuals
              with each experience, giving the user a different experience every
              time. This includes generating textures and shapes, which change
              depending on user interaction, or with the audio input. The
              project also makes use of shaders, which are small programs that
              run on the graphics processing unit (GPU) to generate the final
              images rendered on the screen. These shaders allow for complex and
              dynamic visuals, such as reflections, refractions, and realistic
              lighting effects. Finally, the project utilizes browser based
              technologies, the user can enjoy the immersive experience from
              anywhere and any device with a web browser and internet
              connection. The goal of the project is to provide an entertaining
              and engaging experience for the user, whether for entertainment or
              for other purposes such as gaming, music and other immersive
              experiences. This project is in development and has no real end
              goal as it's simply a method for artistic expression.
          </p>
          <div class="modal-action">
            <label
              for="forge-project"
              class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-fuchsia-500 hover:border-black hover:text-fuchsia-500"
              >close</label
            >
          </div>
        </label>
      </label>
    </div>
  </div>
</template>
