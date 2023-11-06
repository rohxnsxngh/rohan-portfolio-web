<template>

  <div class="flex justify-center items-center h-screen laptop:h-full">
    <div class="card w-full bg-black opacity-80 hover:opacity-100 image-full h-3/4">
      <figure>
        <img src="../assets/turtle-robotics-home.gif" alt="recipestore" />
      </figure>
      <div class="card-body">
        <h2 class="card-title text-2xl tablet:text-4xl">T.U.R.T.L.E Homepage</h2>
        <p class="tablet:text-xl text-lg">Finished</p>
        <div class="card-actions justify-end">
          <label
            for="turtlehomepage-project"
            class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-amber-600 hover:border-black hover:text-amber-600"
            >Learn More</label
          >
        </div>
      </div>
    </div>

    <!-- Put this part before </body> tag -->
    <div class="">
      <input type="checkbox" id="turtlehomepage-project" class="modal-toggle" />
      <label for="turtlehomepage-project" class="modal cursor-pointer">
        <label class="modal-box bg-black glass max-w-screen mx-auto" for="">
          <h4
            class="text-center tablet:text-left text-xl font-bold tablet:text-2xl font-bold mb-4"
          >
          T.U.R.T.L.E Homepage
            <br />
            <a
              href="https://turtle-robotics.vercel.app/"
              class="text-xs tablet:text-sm text-amber-600 hover:underline"
              >demo</a
            >
          </h4>
          <p class="text-xs tablet:text-sm">
            As the developer of the T.U.R.T.L.E Robotics Club website at Texas
              A&M University, I am proud to present a comprehensive resource for
              students interested in robotics and competition. The site was
              designed to introduce new members to the club and its mission of
              building robots and participating in competitions. Visitors can
              find information on past projects and events, as well as sign-up
              forms for prospective members. I have made sure to include all the
              important information for the new members about the club, its
              purpose, upcoming events and competitions. The website is not only
              informative but also easy to navigate. My goal was to create a
              website that is beneficial for both new and experienced members,
              and I believe that I have succeeded in doing so. This website has
              since been moved into a private Texas A&M University domain.
          </p>
          <div class="modal-action">
            <label
              for="turtlehomepage-project"
              class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-amber-600 hover:border-black hover:text-amber-600"
              >close</label
            >
          </div>
        </label>
      </label>
    </div>
  </div>
</template>
