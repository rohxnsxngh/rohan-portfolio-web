<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-4xl sm:text-4xl text-xl">
        Echocardiagram Segmentation.
      </h1>
      <p class="font-bold lg:text-2xl sm:text-2xl text-lg text-primary">
        Machine Learning Researcher.
      </p>
      <p class="font-bold lg:text-xl sm:text-md text-xs text-slate-500">
        September 2023 - Current.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2"
        onclick="research_project.showModal()"
      >
        Learn More
      </button>
      <dialog id="research_project" class="modal">
        <div class="modal-box w-11/12 max-w-5xl bg-primary-content">
          <div>
            <h1 class="font-bold text-xl text-primary">
              Echocardiogram Machine Learning 
              <div class="divider"></div>
              <p class="font-normal text-sm text-white">
                In my pursuit of expanding my expertise, I actively engaged in
                research under the mentorship of Dr. Iman Borazjani. Our
                collaborative research endeavor centered around the application
                of machine learning techniques to echocardiography segmentation,
                with a specific focus on identifying critical cardiac structures
                such as the mitral and aortic valves, left atrium, and left
                ventricle walls within echocardiographic images. My
                contributions to the project involved the implementation of a
                comprehensive set of images preprocessing techniques,
                encompassing normalization, noise reduction through filtering,
                and contrast enhancement. I delved into the implementation of
                the U-Net architecture. Originating in 2015 by Ronneberger et
                al., the U-Net framework is renowned for its effectiveness in
                image-to-image and pixelwise calculations, particularly
                excelling in biomedical segmentation tasks. Working closely with
                PhD students, I contributed to the deployment and adaptation of
                the U-Net model to our echocardiography segmentation project.
                This experience broadened my proficiency in cutting-edge deep
                learning architectures and reinforced my understanding of their
                applicability in intricate medical imaging analyses, further
                enriching my research endeavors. Achieving accurate image
                segmentation was a key milestone, accomplished through a
                strategic combination of thresholding and clustering algorithms.
                Emphasis on feature extraction played a pivotal role,
                characterizing texture patterns and color distributions within
                the images, thereby enhancing the overall precision of the
                model. Leveraging advanced methodologies like transfer learning
                proved to be instrumental in optimizing the model's performance.
                To ensure spatial alignment, image registration methods were
                carefully employed, and morphological operations were applied to
                refine the shape and size of identified cardiac structures. This
                multifaceted experience not only deepened my comprehension of
                reinforcement learning but also provided invaluable insights
                into the intricate interplay of diverse image analysis
                techniques. The anticipated outcomes of this project hold
                substantial promise for advancing diagnostic tools and
                techniques in the realm of medical imaging, underscoring the
                impactful intersection of machine learning and healthcare
                innovation.
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
            src="/Images/ResearchCustomStrats.jpg"
            class="rounded-box object-cover"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/ResearchUNET.jpg"
            class="rounded-box object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</template>
