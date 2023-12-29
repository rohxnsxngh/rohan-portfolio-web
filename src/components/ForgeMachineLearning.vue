<template>
  <div class="flex sm:flex-row flex-col sm:p-8 md:p-4 p-2 space-y-2">
    <div class="lg:h-48 sm:h-32 h-20 flex flex-col mb-8">
      <h1 class="font-bold lg:text-4xl sm:text-4xl text-xl">
        Baseball Machine Learning.
      </h1>
      <p class="font-bold lg:text-2xl sm:text-2xl text-lg text-primary">
        Machine Learning Project.
      </p>
      <p class="font-bold lg:text-xl sm:text-md text-xs text-slate-500">
        August 2023 - Current.
      </p>
      <button
        class="my-2 btn btn-xs sm:btn-sm text-black bg-white border-2 border-primary hover:text-white hover:border-primary w-1/2 inline-block"
        onclick="baseball_project.showModal()"
      >
      <i class="fi fi-bs-info mx-1 text-slate-500"></i>Learn More
      </button>
      <dialog id="baseball_project" class="modal">
        <div class="modal-box h-fit w-11/12 max-w-5xl bg-primary-content">
          <div>
            <h1 class="font-bold text-xl text-primary">
              Machine Learning Applied to Baseball.
              <div class="divider divider-primary"></div>
              <p class="font-normal text-sm text-white">
                The application of machine learning models in baseball umpiring introduces intriguing
possibilities. Firstly, these models would be used to test how alternative umpires might have handled
contentious or close calls. These models could also be used to simulate complete games under different
strike zones. This could help predict the outcome of the game if called by a different umpire. Finally, the
models can contribute to understanding umpire behavior. For example, the models could be used to evaluate
whether an umpire widened their personal strike zone intentionally to influence the conclusion of a game.
The use of machine learning in these scenarios opens avenues for insightful analysis and enhances our
understanding of the dynamics within baseball officiating. This report presented an analysis of pitch strike zone data with the objective of creating a machine
learning model to replicate the "human element" of baseball umpires. The study focused on determining
and replicating individual strike zones of six Major League Baseball (MLB) umpires. The data processing
involved normalizing Z-positions based on the average strike zone measurements in the MLB. The three
machine learning models—Support Vector Machine (SVM), Gradient Boosting Classifier (GBC), and
9
Random Forest Classifier (RFC)—were implemented and tested for accuracy. The results indicated that all
three methods performed similarly, achieving accuracies between 0.883 and 0.890. The report discussed
the potential future applications of these models in testing alternative umpire decisions, simulating complete
games, and understanding umpire behavior.<br/><br/>
<a href="https://github.com/rohxnsxngh/Machine-Learning-MEEN/tree/main/Project"><i class="fi fi-brands-github align-center text-2xl text-primary hover:text-white"></i></a>
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
        class="carousel carousel-center max-w-4xl bg-neutral rounded-box sm:h-1/2 h-96 border-2 border-primary hover:border-white"
      >
        <div class="carousel-item">
          <img
            src="/Images/MachineLearningBaseball.png"
            class="rounded-box object-contain"
            id="item1-ml"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/MachineLearningBaseball1.png"
            class="rounded-box object-contain"
            id="item2-ml"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/MachineLearningBaseball2.png"
            class="rounded-box object-contain"
            id="item3-ml"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/MachineLearningBaseballMapping.png"
            class="rounded-box object-contain"
            id="item4-ml"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/MachineLearningEric.png"
            class="rounded-box object-contain"
            id="item5-ml"
          />
        </div>
        <div class="carousel-item">
          <img
            src="/Images/MachineLearningMalachi.png"
            class="rounded-box object-contain"
            id="item6-ml"
          />
        </div>
      </div>
      <div class="w-full justify-center flex text-xs px-2 h-2 gap-1">
        <a
          href="#item1-ml"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item2-ml"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item3-ml"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item4-ml"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item5-ml"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
        <a
          href="#item6-ml"
          class="bg-primary w-2 rounded ring-2 ring-primary-content hover:bg-primary-content hover:ring-primary"
        ></a>
      </div>
    </div>
  </div>
</template>
