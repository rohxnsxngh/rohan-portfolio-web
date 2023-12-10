import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { createText } from "./three-components/text";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import overlayVertexShader from "./src/shaders/overlay/vertex.glsl";
import overlayFragmentShader from "./src/shaders/overlay/fragment.glsl";
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
import { timeline, returner } from "./three-components/timeline";
import {
  animationInProgress,
  setAnimationInProgress,
} from "./three-components/animationState";

let _cssrenderer, _cssObject, _mixerRobot, _robot;
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const fontLoader = new FontLoader();

// Usage of the createHomeText function
createText(scene, fontLoader);

//helper
// const size = 10;
// const divisions = 10;
// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

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

//Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8);
camera.add(pointLight);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: false,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Robot Model
const loader = new GLTFLoader();
loader.load(
  "/Models/robot/scene.gltf",
  function (gltf) {
    _robot = gltf.scene;
    _robot.position.set(1, -1.65, 0);
    _robot.scale.set(0.9, 0.9, 0.9);
    // object.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    _robot.castShadow = true;
    scene.add(_robot);
    _mixerRobot = new THREE.AnimationMixer(_robot);
    console.log(gltf.animations);
    _mixerRobot.clipAction(gltf.animations[0]).play();
  },
  // // onProgress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },

  // // onError callback
  function (err) {
    console.log("An error happened");
  }
);

const clock = new THREE.Clock();
let previousTime = 0;

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.update()

window.addEventListener("scroll", () => {
  if (!animationInProgress) {
    timeline(camera);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  _cssrenderer = new CSS3DRenderer();
  _cssrenderer.setSize(window.innerWidth, window.innerHeight);
  _cssrenderer.domElement.style.position = "fixed";
  _cssrenderer.domElement.style.top = "0";
  document.body.appendChild(_cssrenderer.domElement);

  const element = document.getElementById("vueapp");
  _cssObject = new CSS3DObject(element);
  _cssObject.position.set(1, -5, 0);
  _cssObject.scale.set(0.0025, 0.0025, 0.0025);
  scene.add(_cssObject);

  // cssObject2 = new CSS3DObject(element2);
  // cssObject2.position.set(0, 0, 0);
  // cssObject2.scale.set(0.005, 0.005, 0.005);
  // cssObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  // scene.add(cssObject2);

  // // Get the button element by its id
  const homeButton = document.getElementById("home");

  // Add a click event listener to the button
  homeButton.addEventListener("click", function () {
    if (!animationInProgress) {
      returner(camera);
    }
  });

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    const isLargeScreen = window.innerWidth > 750;

    if (isLargeScreen && !animationInProgress) {
      const parallaxX = cursor.x * 1.5;
      const parallaxY = -cursor.y * 0.5;

      cameraGroup.position.x +=
        (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
      cameraGroup.position.y +=
        (parallaxY - cameraGroup.position.y) * 5 * deltaTime;
    }

    //robot animation
    if (_mixerRobot) {
      _mixerRobot.update(deltaTime);
    }

    // Update robot rotation based on mouse movement
    if (_robot) {
      // _robot.rotation.x = parallaxY * Math.PI * 0.01
      // _robot.rotation.y = parallaxX * Math.PI * 0.01
      // Bobbing motion for the robot
      const bobbingAmplitude = 0.1; // Adjust as needed
      const bobbingSpeed = 1.0; // Adjust as needed

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
