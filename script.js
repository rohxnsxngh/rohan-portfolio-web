import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { createText } from "./three-components/text";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as TWEEN from "@tweenjs/tween.js";
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

let _css3drenderer,
  _css2Drenderer,
  _cssNavigation,
  _cssInit,
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
createText(scene, fontLoader);

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

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// const size = 10;
// const divisions = 10;
// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

// Base camera
const perspectiveCamera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  10000
);
perspectiveCamera.position.set(1, 0, 1000);
// camera.lookAt(new THREE.Vector3(0,0,0));
cameraGroup.add(perspectiveCamera);

// Orthographic camera
const orthographicCamera = new THREE.OrthographicCamera(
  sizes.width / -2, // left
  sizes.width / 2, // right
  sizes.height / 2, // top
  sizes.height / -2, // bottom
  0.01, // near
  1000 // far
);
orthographicCamera.position.set(1, 0, 6);
orthographicCamera.zoom = 0.9
// cameraGroup.add(orthoCamera);

// Set the initial camera
let camera = perspectiveCamera;

// Function to smoothly transition between cameras
function tweenCamera(targetCamera) {
  new TWEEN.Tween(camera.position)
    .to(targetCamera.position.clone(), 1000) // Adjust the duration as needed
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function () {
      updateCamera();
    })
    .onComplete(function () {
      camera = targetCamera;
    })
    .start();
}

// Add an event listener to toggle the camera on a key press
document.addEventListener("keydown", function (event) {
  if (event.key === "c") {
    // Toggle between Perspective and Orthographic cameras
    let targetCamera =
      camera === perspectiveCamera ? orthographicCamera : perspectiveCamera;
    console.log(targetCamera.position);
    tweenCamera(targetCamera);
  }
});

// Function to update the camera in the renderer
function updateCamera() {
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);

  // Set the new camera for the renderer
  renderer.camera = camera;

  // Update the size of the renderer
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Vignette
cameraGroup.add(overlay.mesh);

//Light
const directionalLight3 = new THREE.DirectionalLight(0x8580df, 0.1);
directionalLight3.position.set(0, 0, 300);
scene.add(directionalLight3);

const directionalLight = new THREE.DirectionalLight(0xb11bfa, 0.8);
directionalLight.position.set(-200, 200, 0);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xfa1d1b, 0.8);
directionalLight2.position.set(200, -200, 0);
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
    });
    _robot.traverse((o) => {
      if (o.isMesh) o.material = newMaterial;
    });
    _robot.position.set(0, -225, 0);
    _robot.scale.set(150, 150, 150);
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

window.addEventListener("scroll", () => {
  if (!animationInProgress) {
    let targetCamera =
      camera === perspectiveCamera ? orthographicCamera : perspectiveCamera;
    tweenCamera(targetCamera);
    // const initialCamera = currentCamera;
    initialAnimation(targetCamera);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  _css3drenderer = new CSS3DRenderer();
  _css3drenderer.setSize(window.innerWidth, window.innerHeight, false);
  _css3drenderer.domElement.style.position = "fixed";
  _css3drenderer.domElement.style.top = "0";
  document.body.appendChild(_css3drenderer.domElement);

  const startButton = document.getElementById("init");
  _cssInit = new CSS3DObject(startButton);
  _cssInit.position.set(0, 0, 0);
  _cssInit.scale.set(5, 5, 5);
  // scene.add(_cssInit);

  const navigationPanel = document.getElementById("navigation-panel");
  _cssNavigation = new CSS3DObject(navigationPanel);
  _cssNavigation.position.set(0, -1000, 1000);
  _cssNavigation.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  _cssNavigation.frustumCulled = false
  // _cssNavigation.scale.set(0.0025, 0.0025, 0.0025);
  scene.add(_cssNavigation);

  const forgePanel = document.getElementById("forge-panel");
  _cssForge = new CSS3DObject(forgePanel);
  _cssForge.position.set(0, -1000, 2000);
  _cssForge.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  _cssForge.frustumCulled = false
  // _cssForge.scale.set(0.0025, 0.0025, 0.0025);
  scene.add(_cssForge);

  const experiencePanel = document.getElementById("experience-panel");
  _cssExperience = new CSS3DObject(experiencePanel);
  _cssExperience.position.set(0, -1000, 3000);
  _cssExperience.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  _cssExperience.frustumCulled = false
  // _cssExperience.scale.set(0.0025, 0.0025, 0.0025);
  scene.add(_cssExperience);

  const aboutPanel = document.getElementById("about-panel");
  _cssAbout = new CSS3DObject(aboutPanel);
  _cssAbout.position.set(0, -1000, 4000);
  _cssAbout.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  _cssAbout.frustumCulled = false
  // _cssAbout.scale.set(0.0025, 0.0025, 0.0025);
  scene.add(_cssAbout);

  const writingPanel = document.getElementById("writing-panel");
  _cssWriting = new CSS3DObject(writingPanel);
  _cssWriting.position.set(0, -1000, 5000);
  _cssWriting.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  _cssWriting.frustumCulled = false
  // _cssWriting.scale.set(0.0025, 0.0025, 0.0025);
  scene.add(_cssWriting);

  const contactPanel = document.getElementById("contact-panel");
  _cssContact = new CSS3DObject(contactPanel);
  _cssContact.position.set(0, -1000, 6000);
  _cssContact.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  _cssContact.frustumCulled = false
  // _cssContact.scale.set(0.0025, 0.0025, 0.0025);
  console.log(_cssContact);
  scene.add(_cssContact);

  document.addEventListener("click", (event) => {
    const target = event.target;

    // Check if the clicked element has an ID and perform the corresponding action
    switch (target.id) {
      case "init":
        if (!animationInProgress) {
          let targetCamera =
            camera === perspectiveCamera
              ? orthographicCamera
              : perspectiveCamera;
          tweenCamera(targetCamera);
          // const initialCamera = currentCamera;
          initialAnimation(targetCamera);
        }

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

    if (isLargeScreen && !animationInProgress) {
      const parallaxX = cursor.x * 0.8;
      const parallaxY = -cursor.y * 0.4;

      cameraGroup.position.x +=
        (parallaxX - cameraGroup.position.x) * 100 * deltaTime;
      cameraGroup.position.y +=
        (parallaxY - cameraGroup.position.y) * 100 * deltaTime;
    }

    // Update tween animations
    TWEEN.update();

    //robot animation
    if (_mixerRobot) {
      _mixerRobot.update(deltaTime);
    }


    //TODO - fix this function
    // if (_robot) {
    //   const frequency = 1; 
    //   const amplitudeFactor = 3;
    //   _robot.position.y += Math.sin(deltaTime * frequency) * amplitudeFactor;
    // }

    // Render
    _css3drenderer.render(scene, camera);
    renderer.render(scene, camera);

    // console.log(camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();

  return _css3drenderer;
});

window.addEventListener("resize", handleWindowResize);

function handleWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  _css3drenderer.setSize(sizes.width, sizes.height);
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.toneMappingWhitePoint = 1.0;
}
