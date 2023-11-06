<template>
  <div class="flex justify-center items-center h-screen laptop:h-full">
    <div class="card w-full glass bg-black opacity-80 hover:opacity-100 image-full h-3/4">
      <figure>
        <img src="../assets/recipeHomeScreen.png" alt="recipestore" />
      </figure>
      <div class="card-body">
        <h2 class="card-title text-2xl tablet:text-4xl">Recipe Store</h2>
        <p class="tablet:text-xl text-lg">Finished</p>
        <div class="card-actions justify-end">
          <label
            for="recipe-project"
            class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-lime-500 hover:border-black hover:text-lime-500"
            >Learn More</label
          >
        </div>
      </div>
    </div>

    <!-- Put this part before </body> tag -->
    <div class="">
      <input type="checkbox" id="recipe-project" class="modal-toggle" />
      <label for="recipe-project" class="modal cursor-pointer">
        <label class="modal-box bg-black glass max-w-screen mx-auto" for="">
          <h4
            class="text-center tablet:text-left text-xl font-bold tablet:text-2xl font-bold mb-4"
          >
            Recipe Store
            <br />
            <a
              href="https://recipe-app-rohxnsxngh.vercel.app/#/"
              class="text-xs tablet:text-sm text-lime-500 hover:underline"
              >demo</a
            >
          </h4>
          <p class="text-xs tablet:text-sm">
            This project is a website that allows users to store and organize
            their favorite recipes. Users can add new recipes to the website,
            which are stored in a database. They can also browse and search
            through existing recipes to find something to cook. In addition to
            storing and browsing recipes, the website includes a feature that
            allows users to plan their grocery lists based on the recipes they
            want to make. This feature pulls the ingredients needed for each
            recipe and organizes them into a list that can be printed or viewed
            on a mobile device for easy shopping. The website also includes a
            feature that allows users to track the expiration dates of their
            groceries. Users can enter the items they have purchased and the
            website will track the expiration date, displaying a reminder to the
            user when it is approaching. Finally, the website will provide an
            overview of the calorie count of each recipe and ingredient to help
            users make informed choices when planning their meals. This project
            is still in progress.
          </p>
          <div class="modal-action">
            <label
              for="recipe-project"
              class="btn btn-xs sm:btn-sm text-black bg-white border-2 border-lime-500 hover:border-black hover:text-lime-500"
              >close</label
            >
          </div>
        </label>
      </label>
    </div>
  </div>
</template>
