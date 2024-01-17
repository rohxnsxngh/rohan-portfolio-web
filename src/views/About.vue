<template>
  <div
    class="text-white overscroll-none saturate-100 subpixel-antialiased bg-primary-content border border-base-300 text-4xl rounded-lg"
    id="about-panel"
  >
    <div class="flex flex-col">
      <div class="m-2">
        <Menu />
      </div>

      <div class="hero min-h-screen">
        <div class="hero-content text-left">
          <div class="max-w-xl">
            <div class="h-fit">
              <h1
                class="text-4xl md:text-4xl lg:text-6xl xl:text-4xl text-left font-bold text-center"
              >
                Little bit about me.
                <div class="divider divider-primary"></div>
                <div class="diff aspect-[16/10] rounded">
                  <div class="diff-item-1">
                    <div
                      class="bg-primary text-primary-content text-9xl font-black grid place-content-center"
                    >
                      <p
                        class="text-sm md:text-md lg:text-lg xl:text-xl font-bold text-left px-6 ml-2"
                      >
                        I graduated from Texas A&M university in fall of
                        2023 with a B.S. in Honors Mechanical Engineering and a
                        minor in Computer Science. My hobbies include playing
                        basketball and soccer or creating anything whether that
                        is developing software or creating artwork. I also love
                        beer🍺 and exploring local breweries.
                      </p>
                    </div>
                  </div>
                  <div class="diff-item-2">
                    <div
                      class="bg-primary-content text-9xl font-black grid place-content-center"
                    >
                      <p
                        class="text-sm md:text-md lg:text-lg xl:text-xl font-semibold text-left px-4"
                      >
                        I am a
                        <span class="text-primary">software engineer</span> with
                        a background in
                        <span class="text-primary">mechanical engineering</span>
                        and a passion for developing innovative solutions. My
                        experience in engineering has given me a solid
                        foundation in the principles of robotics, mechatronics,
                        and dynamics, which I have applied to my work in
                        software development. In my free time, I enjoy exploring
                        new developments in robotics and mechatronics, and
                        applying my skills to personal projects that challenge
                        me to learn and grow.
                      </p>
                    </div>
                  </div>
                  <div class="diff-resizer"></div>
                </div>
              </h1>
            </div>
            <div
              class="mockup-code h-fit opacity-65 mt-6 text-left bg-primary-content border border-primary hover:border-white"
            >
              <pre
                data-prefix="$"
                class="sm:text-2xl text-xl"
              ><code>npm i <span class="text-primary">rohan singh</span></code></pre>
              <pre
                data-prefix=">"
                class="text-red-700 sm:text-2xl text-xl"
              ><code>npm WARN deprecated</code></pre>
              <pre
                data-prefix=">"
                class="text-warning sm:text-2xl text-xl"
              ><code>installing...</code></pre>
              <pre
                data-prefix=">"
                class="text-red-700 sm:text-2xl text-xl"
              ><code>243 dependencies😇</code></pre>
              <pre
                data-prefix=">"
                class="text-success sm:text-2xl text-xl"
              ><code>Done</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Menu from "../components/Menu.vue";

export default {
  name: "about",
  components: {
    Menu,
  },
  data() {
    return {
      observer: null,
    };
  },
};
</script>
