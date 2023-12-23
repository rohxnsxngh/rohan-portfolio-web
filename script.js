import * as THREE from "three";
import { gsap } from "gsap";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { createText } from "./three-components/text";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { overlay } from "./three-components/overlay";
import {
  initialAnimation,
  navigationAnimation,
  homeAnimation,
  aboutAnimation,
  forgeAnimation,
  experienceAnimation,
  writingAnimation,
  contactAnimation,
} from "./three-components/animation";
import {
  animationInProgress,
  setAnimationInProgress,
} from "./three-components/animationState";
import { sound } from "./three-components/sound";

let _cssrenderer,
  _cssInit,
  _cssNavigation,
  _cssForge,
  _cssExperience,
  _cssAbout,
  _cssWriting,
  _cssContact;
let _mixerRobot, _robot;
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const fontLoader = new FontLoader();

// Usage of the createHomeText function
const text = createText(scene, fontLoader);
console.log(text)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//vignette
// scene.add(overlay.mesh);

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 0, 6);
// camera.lookAt(new THREE.Vector3(0,0,0));
cameraGroup.add(camera);

// Vignette
camera.add(overlay.mesh);

// Fog
// scene.fog = new THREE.Fog(0x000000, 6, 10);

//Light
const directionalLight3 = new THREE.DirectionalLight(0x8580df, 0.1);
directionalLight3.position.set(0, 0, 3);
scene.add(directionalLight3);

const directionalLight = new THREE.DirectionalLight(0xb11bfa, 0.8);
directionalLight.position.set(-2, 2, 0);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xfa1d1b, 0.8);
directionalLight2.position.set(2, -2, 0);
scene.add(directionalLight2);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height, false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const manager = new THREE.LoadingManager();

const progressBar = document.getElementById("progress-bar");
const loadingContainer = document.querySelector("div.loading-container");

manager.onProgress = (url, loaded, total) => {
  progressBar.value = (loaded / total) * 100;
};

manager.onLoad = () => {
  loadingContainer.style.display = "none";
};

//Robot Model
const loader = new GLTFLoader(manager);
loader.load(
  "/Models/robot/scene.gltf",
  function (gltf) {
    _robot = gltf.scene;
    var newMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x000000, //change color
      specular: 0xffffff, //0xEB00D5
      shininess: 15,
      flatShading: true,
      // transparent: true,
      // opacity: 0
    });
    _robot.traverse((o) => {
      if (o.isMesh) o.material = newMaterial;
    });
    _robot.position.set(1, -1.65, 0);
    _robot.scale.set(0.9, 0.9, 0.9);
    _robot.castShadow = true;
    scene.add(_robot);
    _mixerRobot = new THREE.AnimationMixer(_robot);
    _mixerRobot.timeScale = 1.25;
    _mixerRobot.clipAction(gltf.animations[0]).play();
  },
  // // onProgress callback
  function (xhr) {
    const progress = (xhr.loaded / xhr.total) * 100;
    console.log(progress);
  },

  // // onError callback
  function (err) {
    console.log(err, "An error happened");
  }
);

const clock = new THREE.Clock();
let previousTime = 0;

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.update()

document.addEventListener("DOMContentLoaded", () => {
  _cssrenderer = new CSS2DRenderer();
  _cssrenderer.setSize(window.innerWidth, window.innerHeight, false);
  _cssrenderer.domElement.style.position = "fixed";
  _cssrenderer.domElement.style.top = "0";
  document.body.appendChild(_cssrenderer.domElement);

  const initPanel = document.getElementById("init-panel");
  _cssInit = new CSS2DObject(initPanel);
  _cssInit.position.set(1, 0, 0);
  // _cssInit.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(_cssInit);

  const navigationPanel = document.getElementById("navigation-panel");
  _cssNavigation = new CSS2DObject(navigationPanel);
  _cssNavigation.position.set(1, -6, 6);
  _cssNavigation.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(_cssNavigation);

  const forgePanel = document.getElementById("forge-panel");
  _cssForge = new CSS2DObject(forgePanel);
  _cssForge.position.set(1, -6, 10);
  _cssForge.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(_cssForge);

  const experiencePanel = document.getElementById("experience-panel");
  _cssExperience = new CSS2DObject(experiencePanel);
  _cssExperience.position.set(1, -6, 14);
  _cssExperience.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(_cssExperience);

  const aboutPanel = document.getElementById("about-panel");
  _cssAbout = new CSS2DObject(aboutPanel);
  _cssAbout.position.set(1, -6, 18);
  _cssAbout.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(_cssAbout);

  const writingPanel = document.getElementById("writing-panel");
  _cssWriting = new CSS2DObject(writingPanel);
  _cssWriting.position.set(1, -6, 22);
  _cssWriting.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(_cssWriting);

  const contactPanel = document.getElementById("contact-panel");
  _cssContact = new CSS2DObject(contactPanel);
  _cssContact.position.set(1, -6, 26);
  _cssContact.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  scene.add(_cssContact);

  document.addEventListener("click", async(event) => {
    const target = event.target;

    if (target.id === "init-panel" && !animationInProgress) {
      // enterFullscreen();
      console.log(text)
      initialAnimation(camera);
      await new Promise(resolve => setTimeout(resolve, 5000));
      if (_robot) {
        _robot.traverse((o) => {
          if (o.isMesh) {
            o.material.transparent = true;
            o.material.opacity = 0;
          }
        });
      }
    }
  });

  // Function to enter fullscreen
  function enterFullscreen() {
    var element = document.documentElement; // Fullscreen the entire document
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    // Check if the clicked element has an ID and perform the corresponding action
    switch (target.id) {
      case "init-panel":
        if (!animationInProgress) initialAnimation(camera);
        sound(camera);
        break;
      case "home":
        if (!animationInProgress) homeAnimation(camera, 6);
        break;
      case "navigation":
        if (!animationInProgress)
          navigationAnimation(camera, _cssNavigation.position.z);
        break;
      case "forge":
        if (!animationInProgress) forgeAnimation(camera, _cssForge.position.z);
        break;
      case "experience":
        if (!animationInProgress)
          experienceAnimation(camera, _cssExperience.position.z);
        break;
      case "about":
        if (!animationInProgress) aboutAnimation(camera, _cssAbout.position.z);
        break;
      case "writing":
        if (!animationInProgress)
          writingAnimation(camera, _cssWriting.position.z);
        break;
      case "contact":
        if (!animationInProgress)
          contactAnimation(camera, _cssContact.position.z);
        break;
      default:
        break;
    }
  });

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    const isLargeScreen = window.innerWidth > 750;

    // if (isLargeScreen && !animationInProgress) {
    //   const parallaxX = cursor.x * 0.8;
    //   const parallaxY = -cursor.y * 0.4;

    //   cameraGroup.position.x +=
    //     (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
    //   cameraGroup.position.y +=
    //     (parallaxY - cameraGroup.position.y) * 5 * deltaTime;
    // }

    //robot animation
    if (_mixerRobot) {
      _mixerRobot.update(deltaTime);
    }

    // Update robot rotation based on mouse movement
    if (_robot) {
      const bobbingAmplitude = 0.1;
      const bobbingSpeed = 1.0;

      const bobbingHeight =
        Math.sin(elapsedTime * bobbingSpeed) * bobbingAmplitude;
      _robot.position.y = bobbingHeight - 1.5; // Adjust the base height as needed
    }

    // Render
    renderer.render(scene, camera);
    _cssrenderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();

  return _cssrenderer;
});

window.addEventListener("resize", handleWindowResize);

function handleWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  _cssrenderer.setSize(sizes.width, sizes.height);

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.toneMappingWhitePoint = 1.0;
}
