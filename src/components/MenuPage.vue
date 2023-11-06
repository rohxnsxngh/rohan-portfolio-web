<template>
  <nav class="glass sticky top-0">
    <a href="#home" class="text-white font-semibold antialiased">Home</a>
    <a href="#about" class="text-white font-semibold antialiased">About</a>
    <a href="#forge" class="text-white font-semibold antialiased">Projects</a>
    <a href="#experience" class="text-white font-semibold antialiased">Experience</a>
    <a href="#contact" class="text-white font-semibold antialiased">Contact</a>
    <div class="animation start-home"></div>
  </nav>
</template>

<style scoped>
@media only screen and (min-width: 768px) {
  /* For desktop: */
  nav {
    margin: 27px auto 0;
    position: relative;
    width: 590px;
    height: 50px;
    background-color: #000000;
    border-radius: 8px;
    font-size: 0;
    font-family: "Lucida Console", "Courier New", monospace;
    font: bold;
    opacity: 80%;
  }
  nav a {
    line-height: 50px;
    height: 100%;
    font-size: 15px;
    display: inline-block;
    position: relative;
    z-index: 1;
    text-decoration: none;
    text-transform: uppercase;
    text-align: center;
    cursor: pointer;
  }
  nav .animation {
    position: absolute;
    height: 100%;
    top: 0;
    z-index: 0;
    transition: all 0.5s ease 0s;
    border-radius: 8px;
  }
  a:nth-child(1) {
    width: 100px;
  }
  a:nth-child(2) {
    width: 110px;
  }
  a:nth-child(3) {
    width: 100px;
  }
  a:nth-child(4) {
    width: 160px;
  }
  a:nth-child(5) {
    width: 120px;
  }
  nav .start-home,
  a:nth-child(1):hover ~ .animation {
    width: 100px;
    left: 0;
    opacity: 0.1;
    background-color: #ffffff;
  }
  nav .start-about,
  a:nth-child(2):hover ~ .animation {
    width: 110px;
    left: 100px;
    background-color: #ffffff;
  }
  nav .start-blog,
  a:nth-child(3):hover ~ .animation {
    width: 100px;
    left: 210px;
    background-color: #ffffff;
  }
  nav .start-portefolio,
  a:nth-child(4):hover ~ .animation {
    width: 160px;
    left: 310px;
    background-color: #ffffff;
  }
  nav .start-contact,
  a:nth-child(5):hover ~ .animation {
    width: 120px;
    left: 470px;
    background-color: #ffffff;
  }
}




@media only screen and (max-width: 768px) {
/* for tablets and below */
nav {
    margin: 27px auto 0;
    position: relative;
    width: 420px;
    height: 35px;
    background-color: #000000;
    border-radius: 8px;
    font-size: 0;
    font-family: "Helvetica";
    font: bold;
    opacity: 80%;
  }
  nav a {
    line-height: 38px;
    height: 100%;
    font-size: 10px;
    display: inline-block;
    position: relative;
    z-index: 1;
    text-decoration: none;
    text-transform: uppercase;
    text-align: center;
    cursor: pointer;
  }
  nav .animation {
    position: absolute;
    height: 100%;
    top: 0;
    z-index: 0;
    transition: all 0.5s ease 0s;
    border-radius: 8px;
  }
  a:nth-child(1) {
    width: 80px;
  }
  a:nth-child(2) {
    width: 80px;
  }
  a:nth-child(3) {
    width: 80px;
  }
  a:nth-child(4) {
    width: 100px;
  }
  a:nth-child(5) {
    width: 80px;
  }
  nav .start-home,
  a:nth-child(1):hover ~ .animation {
    width: 80px;
    left: 0;
    opacity: 0.1;
    background-color: #ffffff;
  }
  nav .start-about,
  a:nth-child(2):hover ~ .animation {
    width: 80px;
    left: 80px;
    background-color: #ffffff;
  }
  nav .start-blog,
  a:nth-child(3):hover ~ .animation {
    width: 80px;
    left: 155px;
    background-color: #ffffff;
  }
  nav .start-portefolio,
  a:nth-child(4):hover ~ .animation {
    width: 100px;
    left: 240px;
    background-color: #ffffff;
  }
  nav .start-contact,
  a:nth-child(5):hover ~ .animation {
    width: 80px;
    left: 340px;
    background-color: #ffffff;
  }
}

@media only screen and (max-width: 425px) {
/* ancient */

nav {
  visibility: hidden;
}

}
</style>
