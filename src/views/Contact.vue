<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 opacity-60 text-4xl rounded-lg opacity-90 md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
    id="contact-panel"
  >
    <div class="flex flex-col">
      <div class="m-2">
        <Menu />
      </div>

      <div class="hero min-h-screen">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">
              Contact

              <div class="divider divider-primary"></div>
              <p
                class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-center"
              >
                Get in touch!<br/><br/>
                <a href="https://github.com/rohxnsxngh"><i class="fi fi-brands-github align-center text-3xl text-primary hover:text-white"></i></a><br/><br/>
                <a href="mailto:rohan.singh.do@gmail.com"><i class="fi fi fi-sr-envelope align-center text-3xl text-primary hover:text-white"></i></a><br/><br/>
                <a href="https://www.linkedin.com/in/rohan-singh1122/"><i class="fi fi fi-brands-linkedin align-center text-3xl text-primary hover:text-white"></i></a><br/><br/>
                <a href="/Rohan_Singh_Resume_2023.pdf" target="_blank" rel="noopener noreferrer" class="underline text-primary hover:text-white">resume.</a>
              </p>
            </h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Menu from "../components/Menu.vue";

export default {
  name: "contact",
  components: {
    Menu,
  },
};
</script>
