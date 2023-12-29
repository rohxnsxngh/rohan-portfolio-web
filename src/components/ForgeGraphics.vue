<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-4xl sm:text-4xl text-xl">
        Graphics Experiment.
      </h1>
      <p class="font-bold lg:text-2xl sm:text-2xl text-lg text-primary">
        Personal Project.
      </p>
      <p class="font-bold lg:text-xl sm:text-md text-xs text-slate-500">
        January 2023 - Current.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2 inline-block"
        onclick="graphics_project.showModal()"
      >
      <i class="fi fi-bs-info mx-1 text-slate-500"></i>Learn More
      </button>
      <dialog id="graphics_project" class="modal">
        <div class="modal-box h-fit w-11/12 max-w-5xl bg-primary-content">
          <div>
            <h1 class="font-bold text-xl text-primary">
              Graphics, ThreeJS, & Shaders Experiment.
              <div class="divider"></div>
              <p class="font-normal text-sm text-white">
                This project is an immersive, entertaining experience that allows users to interact with dynamic and engaging visuals. It was built as a platform for experimenting with various techniques in computer graphics and audio processing, such as audio visualizers, shaders, procedural generation, and textures.
The project is built primarily with Three.js, a JavaScript library for creating and displaying 3D graphics on web browsers. The project aims to leverage the power of Three.js to create a rich, interactive and visually stunning experience for the user. It utilizes audio input to drive the animation and visuals of the scene, creating a real-time audio visualization. It also uses 3D models created in Blender and exported to be displayed in the browser.
Procedural generation techniques are used to create unique and varied visuals with each experience, giving the user a different experience every time. This includes generating textures and shapes, which change depending on user interaction, or with the audio input.
The project also makes use of shaders, which are small programs that run on the graphics processing unit (GPU) to generate the final images rendered on the screen. These shaders allow for complex and dynamic visuals, such as reflections, refractions, and realistic lighting effects.
Finally, the project utilizes browser based technologies, the user can enjoy the immersive experience from anywhere and any device with a web browser and internet connection. The goal of the project is to provide an entertaining and engaging experience for the user, whether for entertainment or for other purposes such as gaming, music and other immersive experiences. This project is in development and has no real end goal as it's simply a method for artistic expression.
<br/><br/>
<a href="https://github.com/rohxnsxngh/hans-aubs"><i class="fi fi-brands-github align-center text-2xl text-primary hover:text-white"></i></a>
<a href="https://rohxnsxngh.vercel.app/" class="mx-4"><i class="fi fi fi-rr-globe align-center text-2xl text-primary hover:text-white"></i></a>


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
    <div class="">
      <div
        class="carousel carousel-center max-w-4xl bg-neutral rounded-box sm:h-full h-96 border-2 border-primary hover:border-white"
      >
        <div class="carousel-item">
          <img src="/Images/HansAubsHome.png" class="rounded-box object-cover" id="item1-forge" />
        </div>
        <div class="carousel-item">
          <img src="/Images/HansAubsLab.png" class="rounded-box object-cover" id="item2-forge"/>
        </div>
        <div class="carousel-item">
          <img src="/Images/HansAubsForge.png" class="rounded-box object-cover" id="item3-forge"/>
        </div>
      </div>
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a
          href="#item1-forge"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item2-forge"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item3-forge"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
    </div>
  </div>
</template>
