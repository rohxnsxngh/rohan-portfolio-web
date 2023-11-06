<template>
  <div class="carousel w-full backdrop-blur-sm">
    <div id="slide1" class="carousel-item relative w-full">
      <div>
        <img class="w-84" src="" />
        <div>
          <h1
            class="shadow-sky-800 shadow-sm my-4 text-xl text-regal-blue tablet:text-2xl text-regal-blue"
          >
            Coming Soon:
          </h1>
          <p class="text-sm font-semibold tablet:text-md font-semibold"></p>
        </div>
      </div>
      <div
        class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
      >
        <a
          href="#slide4"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❮</a
        >
        <a
          href="#slide2"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❯</a
        >
      </div>
    </div>
    <div id="slide2" class="carousel-item relative w-full">
      <div>
        <img class="w-84" src="../assets/three-portfolio.gif" />
        <div>
          <h1
            class="shadow-sky-800 shadow-sm my-4 text-xl text-regal-blue tablet:text-2xl text-regal-blue"
          >
            Coming Soon:
          </h1>
          <p class="text-sm font-semibold tablet:text-md font-semibold"></p>
        </div>
      </div>
      <div
        class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
      >
        <a
          href="#slide1"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❮</a
        >
        <a
          href="#slide3"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❯</a
        >
      </div>
    </div>
    <div id="slide3" class="carousel-item relative w-full">
      <div>
        <img src="../assets/comingSoon.jpg" class="w-full" />
        <!-- <div>Slide3</div> -->
      </div>
      <div
        class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
      >
        <a
          href="#slide2"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❮</a
        >
        <a
          href="#slide4"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❯</a
        >
      </div>
    </div>
    <div id="slide4" class="carousel-item relative w-full">
      <div>
        <img src="../assets/comingSoon.jpg" class="w-full" />
        <!-- <div>Slide4</div> -->
      </div>
      <div
        class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
      >
        <a
          href="#slide3"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❮</a
        >
        <a
          href="#slide1"
          class="btn btn-xs btn-circle mb-96 tablet:btn tablet:btn-circle tablet:bg-regal-blue tablet:text-white tablet:mb-32"
          >❯</a
        >
      </div>
    </div>
  </div>
</template>
